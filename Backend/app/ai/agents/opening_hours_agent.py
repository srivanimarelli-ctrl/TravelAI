import os
import asyncio
import httpx
from app.ai.orchestrator.state import TravelState

GOOGLE_PLACES_API_KEY = os.environ.get("GOOGLE_PLACES_API_KEY", "")
SERPAPI_API_KEY = os.environ.get("SERPAPI_API_KEY", "")
PLACES_API_BASE_URL = "https://places.googleapis.com/v1/places"

async def fetch_place_details(client: httpx.AsyncClient, attraction_name: str, destination: str, semaphore: asyncio.Semaphore):
    """
    Fetch the place details for opening hours using Google Places API (New), or fallback to SerpAPI (Free Tier).
    """
    async with semaphore:
        if GOOGLE_PLACES_API_KEY:
            search_url = f"{PLACES_API_BASE_URL}:searchText"
            search_payload = {
                "textQuery": f"{attraction_name} in {destination}"
            }
            search_headers = {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
                "X-Goog-FieldMask": "places.id"
            }
            
            try:
                search_resp = await client.post(search_url, json=search_payload, headers=search_headers)
                search_resp.raise_for_status()
                search_data = search_resp.json()
                
                places = search_data.get("places", [])
                if not places:
                    return {"error": "Place not found"}
                    
                place_id = places[0]["id"]
                
                details_url = f"{PLACES_API_BASE_URL}/{place_id}"
                details_headers = {
                    "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
                    "X-Goog-FieldMask": "id,displayName,currentOpeningHours,regularOpeningHours,photos,location,formattedAddress,rating,userRatingCount"
                }
                
                details_resp = await client.get(details_url, headers=details_headers)
                details_resp.raise_for_status()
                data = details_resp.json()
                data["api_source"] = "google_places"
                return data
                
            except Exception as e:
                return {"error": str(e)}
                
        elif SERPAPI_API_KEY:
            # Fallback to SerpAPI Local Results
            try:
                params = {
                    "engine": "google_local",
                    "q": f"{attraction_name} {destination}",
                    "api_key": SERPAPI_API_KEY
                }
                resp = await client.get("https://serpapi.com/search.json", params=params)
                resp.raise_for_status()
                data = resp.json()
                
                local_results = data.get("local_results", [])
                if not local_results:
                    return {"error": "Place not found via SerpAPI"}
                
                first_result = local_results[0]
                first_result["api_source"] = "serpapi"
                return first_result
                
            except Exception as e:
                return {"error": str(e)}
        else:
            return {"error": "Missing GOOGLE_PLACES_API_KEY and SERPAPI_API_KEY"}

from datetime import datetime, timedelta

def determine_status(api_data: dict, target_date: datetime) -> tuple[str, str]:
    if not api_data or "error" in api_data:
        return "UNKNOWN", api_data.get("error", "No data")

    api_source = api_data.get("api_source")
    
    if api_source == "google_places":
        target_google_day = (target_date.weekday() + 1) % 7
        regular_hours = api_data.get("regularOpeningHours", {})
        periods = regular_hours.get("periods", [])
        
        if not periods:
            return "UNKNOWN", "No regular opening hours provided by API"
            
        for period in periods:
            open_time = period.get("open", {})
            if open_time.get("day") == target_google_day:
                return "OPEN", "Regular schedule indicates it is open on this day."
                
        return "CLOSED", "Regular schedule indicates it is closed on this day."
        
    elif api_source == "serpapi":
        target_day_name = target_date.strftime("%A").lower()
        operating_hours = api_data.get("operating_hours", {})
        
        if not operating_hours:
            return "UNKNOWN", "No operating hours provided by SerpAPI"
            
        day_schedule = operating_hours.get(target_day_name, "").lower()
        if not day_schedule:
            return "UNKNOWN", "No schedule for target day in SerpAPI"
            
        if "closed" in day_schedule:
            return "CLOSED", "SerpAPI indicates it is closed on this day."
            
        return "OPEN", f"SerpAPI indicates open: {day_schedule}"
        
    return "UNKNOWN", "Unsupported API Source"

def opening_hours_node(state: TravelState) -> dict:
    destination = state.get("destination", "")
    attractions = state.get("attractions") or []
    days = int(state.get("days") or 3)
    
    print(f"--- OPENING HOURS AGENT: Fetching live hours for {len(attractions)} attractions in {destination} ---")
    
    # Run async fetch
    async def run_fetches():
        semaphore = asyncio.Semaphore(5) # Bounded concurrency of 5
        async with httpx.AsyncClient(timeout=10.0) as client:
            tasks = [
                fetch_place_details(client, attr.get("name", ""), destination, semaphore)
                for attr in attractions
            ]
            return await asyncio.gather(*tasks)
            
    try:
        results = asyncio.run(run_fetches())
    except Exception as e:
        print(f"--- OPENING HOURS AGENT: Error running asyncio: {e} ---")
        results = [{"error": str(e)}] * len(attractions)
    
    # Process and assign validation logic
    start_date = datetime.now() + timedelta(days=30)
    
    validated_attractions = []
    
    for i, attr in enumerate(attractions):
        target_date = start_date + timedelta(days=i % days)
        res = results[i] if i < len(results) else {}
        status, reason = determine_status(res, target_date)
        
        attr["status"] = status
        attr["reason"] = reason
        attr["source"] = res.get("api_source", "Live API")
        attr["scheduled_date"] = target_date.strftime("%Y-%m-%d")
        attr["day_of_week"] = target_date.strftime("%A")
        
        # Opening hours
        if res.get("api_source") == "google_places":
            attr["opening_hours"] = res.get("regularOpeningHours", {}).get("weekdayDescriptions", [])
            # Photos
            photos = res.get("photos", [])
            if photos and len(photos) > 0 and GOOGLE_PLACES_API_KEY:
                photo_name = photos[0].get("name")
                attr["thumbnail"] = f"https://places.googleapis.com/v1/{photo_name}/media?maxHeightPx=600&maxWidthPx=800&key={GOOGLE_PLACES_API_KEY}"
            # Coordinates
            loc = res.get("location", {})
            if loc.get("latitude"):
                attr["lat"] = loc.get("latitude")
                attr["lon"] = loc.get("longitude")
            if res.get("formattedAddress"):
                attr["address"] = res.get("formattedAddress")
            if res.get("rating"):
                attr["rating"] = res.get("rating")
            if res.get("userRatingCount"):
                attr["reviews"] = res.get("userRatingCount")
        elif res.get("api_source") == "serpapi":
            # Convert dict hours to list of strings
            op_dict = res.get("operating_hours", {})
            if isinstance(op_dict, dict):
                attr["opening_hours"] = [f"{day.title()}: {hours}" for day, hours in op_dict.items()]
            elif isinstance(op_dict, list):
                attr["opening_hours"] = op_dict
            
            # SerpAPI Thumbnail
            if res.get("thumbnail"):
                attr["thumbnail"] = res.get("thumbnail")
            
            # Coordinates
            gps = res.get("gps_coordinates", {})
            if gps.get("latitude"):
                attr["lat"] = gps.get("latitude")
                attr["lon"] = gps.get("longitude")
            if res.get("address"):
                attr["address"] = res.get("address")
            if res.get("rating"):
                attr["rating"] = res.get("rating")
            if res.get("reviews"):
                attr["reviews"] = res.get("reviews")

        validated_attractions.append(attr)
    
    return {
        "attractions": validated_attractions,
        "completed_steps": state.get("completed_steps", []) + ["opening_hours"]
    }

