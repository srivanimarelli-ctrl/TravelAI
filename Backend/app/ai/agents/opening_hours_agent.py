import os
import asyncio
import httpx
from app.ai.orchestrator.state import TravelState

GOOGLE_PLACES_API_KEY = os.environ.get("GOOGLE_PLACES_API_KEY", "")
PLACES_API_BASE_URL = "https://places.googleapis.com/v1/places"

async def fetch_place_details(client: httpx.AsyncClient, attraction_name: str, destination: str, semaphore: asyncio.Semaphore):
    """
    Fetch the place ID and then the details for opening hours using Google Places API (New).
    """
    async with semaphore:
        if not GOOGLE_PLACES_API_KEY:
            return {"error": "Missing GOOGLE_PLACES_API_KEY"}
            
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
                "X-Goog-FieldMask": "id,displayName,currentOpeningHours,regularOpeningHours"
            }
            
            details_resp = await client.get(details_url, headers=details_headers)
            details_resp.raise_for_status()
            return details_resp.json()
            
        except Exception as e:
            return {"error": str(e)}

from datetime import datetime, timedelta

def determine_status(google_data: dict, target_date: datetime) -> tuple[str, str]:
    if not google_data or "error" in google_data:
        return "UNKNOWN", google_data.get("error", "No data")

    # Places API uses 0 = Sunday, 1 = Monday... 6 = Saturday
    # Python datetime.weekday() uses 0 = Monday, ..., 6 = Sunday
    target_google_day = (target_date.weekday() + 1) % 7
    
    regular_hours = google_data.get("regularOpeningHours", {})
    periods = regular_hours.get("periods", [])
    
    if not periods:
        return "UNKNOWN", "No regular opening hours provided by API"
        
    # Check if the place has an open period on the target day
    for period in periods:
        open_time = period.get("open", {})
        if open_time.get("day") == target_google_day:
            return "OPEN", "Regular schedule indicates it is open on this day."
            
    return "CLOSED", "Regular schedule indicates it is closed on this day."

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
        # We assign an arbitrary day from the trip to validate against, or we validate for all days.
        # For simplicity and to match the route agent, we'll validate against a specific day of the trip.
        # Alternatively, we could attach the full schedule.
        # Since the Route Agent loops `for i in range(days): attraction = attractions[i % len(attractions)]`,
        # let's just validate it for the day it's most likely to be assigned, or we just validate it against the start date.
        
        target_date = start_date + timedelta(days=i % days)
        status, reason = determine_status(results[i], target_date)
        
        attr["status"] = status
        attr["reason"] = reason
        attr["source"] = "Google Places API"
        attr["scheduled_date"] = target_date.strftime("%Y-%m-%d")
        attr["day_of_week"] = target_date.strftime("%A")
        attr["opening_hours"] = results[i].get("regularOpeningHours", {}).get("weekdayDescriptions", [])
        
        validated_attractions.append(attr)
    
    return {
        "attractions": validated_attractions,
        "completed_steps": state.get("completed_steps", []) + ["opening_hours"]
    }

