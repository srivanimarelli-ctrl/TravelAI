import json
import httpx
from app.ai.llm import llm
from app.ai.orchestrator.state import TravelState
from langchain_core.prompts import ChatPromptTemplate
from app.ai.rag.retriever import retrieve_travel_knowledge

OVERPASS_API_URL = "https://overpass-api.de/api/interpreter"

# Coordinates map for major Indian travel destinations
CITY_COORDINATES = {
    "jaipur": {"lat": 26.9124, "lon": 75.7873},
    "goa": {"lat": 15.2993, "lon": 74.1240},
    "delhi": {"lat": 28.6139, "lon": 77.2090},
    "mumbai": {"lat": 19.0760, "lon": 72.8777},
    "bengaluru": {"lat": 12.9716, "lon": 77.5946},
    "bangalore": {"lat": 12.9716, "lon": 77.5946},
    "agra": {"lat": 27.1767, "lon": 78.0081},
    "varanasi": {"lat": 25.3176, "lon": 82.9739},
    "udaipur": {"lat": 24.5854, "lon": 73.7125},
    "leh": {"lat": 34.1526, "lon": 77.5771},
    "amritsar": {"lat": 31.6340, "lon": 74.8723},
    "kerala": {"lat": 9.9312, "lon": 76.2673},
    "kochi": {"lat": 9.9312, "lon": 76.2673},
    "darjeeling": {"lat": 27.0410, "lon": 88.2663},
    "shimla": {"lat": 31.1048, "lon": 77.1734},
    "manali": {"lat": 32.2432, "lon": 77.1892},
    "ooty": {"lat": 11.4102, "lon": 76.6950}
}

def fetch_real_restaurants_overpass(destination: str):
    """
    Fetch real-time restaurants and cafes from OpenStreetMap Overpass API.
    Returns a list of restaurant dictionaries or None if query fails.
    """
    dest_key = destination.lower().strip()
    coords = CITY_COORDINATES.get(dest_key)
    if not coords:
        return None

    print(f"--- RESTAURANT AGENT: Querying Overpass OpenStreetMap API for '{destination}' ({coords['lat']}, {coords['lon']}) ---")
    
    # Overpass QL query
    overpass_query = f"""
    [out:json][timeout:15];
    (
      node["amenity"="restaurant"](around:5000, {coords['lat']}, {coords['lon']});
      node["amenity"="cafe"](around:5000, {coords['lat']}, {coords['lon']});
    );
    out center 15;
    """
    
    headers = {
        "User-Agent": "TravelAI_RestaurantBot/1.0 (contact: dev@travelai.local)",
        "Accept": "application/json"
    }
    
    try:
        response = httpx.post(
            OVERPASS_API_URL, 
            data={"data": overpass_query}, 
            headers=headers,
            timeout=15.0
        )
        response.raise_for_status()
        data = response.json()
        
        elements = data.get("elements", [])
        if not elements:
            print("--- RESTAURANT AGENT: No elements found from Overpass API. ---")
            return None
            
        formatted_restaurants = []
        for element in elements:
            tags = element.get("tags", {})
            name = tags.get("name")
            if not name:
                continue # Skip unnamed spots
                
            cuisine = tags.get("cuisine", "Local & Multi-Cuisine").replace("_", " ").replace(";", ", ").title()
            street = tags.get("addr:street", "")
            city_name = tags.get("addr:city", destination.title())
            address = f"{street}, {city_name}".strip(", ") if street else f"Central Area, {destination.title()}"
            
            popular_dish = "Chef's Local Special"
            if "indian" in cuisine.lower():
                popular_dish = "Traditional Thali / Tandoori Special"
            elif "seafood" in cuisine.lower():
                popular_dish = "Goan Fish Curry & Rice"
            elif "cafe" in tags.get("amenity", ""):
                popular_dish = "Fresh Brewed Coffee & Pastries"

            formatted_restaurants.append({
                "name": name,
                "cuisine": cuisine,
                "price_range": "$$",
                "rating": "4.3",
                "address": address,
                "popular_dish": popular_dish
            })
            
            if len(formatted_restaurants) >= 4:
                break
                
        if formatted_restaurants:
            print(f"--- RESTAURANT AGENT: Successfully retrieved {len(formatted_restaurants)} live restaurants from OpenStreetMap! ---")
            return formatted_restaurants
        return None
        
    except Exception as e:
        print(f"--- RESTAURANT AGENT: Overpass API error: {e}. Falling back to RAG/LLM. ---")
        return None


RESTAURANT_PROMPT = ChatPromptTemplate.from_messages([
    (
        "system",
        "You are a local culinary and restaurant specialist assistant. Your job is to provide a list of 3-4 realistic "
        "dining/restaurant recommendations in the destination {destination} based on the trip outline: {planner_draft}.\n"
        "Here is some local culinary and dining knowledge retrieved from our database:\n"
        "{rag_context}\n\n"
        "Take into consideration the user's preferences: {preferences}.\n"
        "Return ONLY a raw JSON list of objects. Each object MUST contain these keys: name, cuisine, price_range, rating, address, popular_dish.\n"
        "Do not include markdown wrapper, explanation, or notes. Example output:\n"
        '[{{"name": "Britto\'s Restaurant", "cuisine": "Goan Seafood", "price_range": "$$", "rating": "4.2", "address": "Baga Beach, Goa", "popular_dish": "Goan Fish Curry"}}, ...]'
    ),
    ("human", "Get restaurant options.")
])

def restaurant_node(state: TravelState) -> dict:
    print(f"--- RESTAURANT AGENT: Finding restaurants in {state['destination']} ---")
    
    # 1. Try Live OpenStreetMap Overpass API first
    live_restaurants = fetch_real_restaurants_overpass(state["destination"])
    if live_restaurants:
        return {"restaurants": live_restaurants}
    
    # 2. Fallback to ChromaDB RAG + Local Qwen LLM
    rag_context = retrieve_travel_knowledge(f"{state['destination']} restaurants dining food cafes shacks dishes fish curry seafood costs", k=2)
    
    prompt_val = RESTAURANT_PROMPT.format_messages(
        destination=state["destination"],
        planner_draft=state.get("planner_draft") or "No draft outline",
        preferences=state.get("preferences") or "None",
        rag_context=rag_context or "No specific restaurant database records found."
    )
    
    response = llm.invoke(prompt_val)
    
    content = response.content.strip()
    if content.startswith("```"):
        content = "\n".join(content.split("\n")[1:])
    if content.endswith("```"):
        content = "\n".join(content.split("\n")[:-1])
    content = content.strip()
    
    try:
        restaurant_data = json.loads(content)
        if not isinstance(restaurant_data, list):
            restaurant_data = [restaurant_data]
        return {
            "restaurants": restaurant_data
        }
    except Exception as e:
        print(f"Error parsing restaurant JSON: {e}")
        return {
            "restaurants": [
                {
                    "name": f"Traditional Food Spot in {state['destination']}",
                    "cuisine": "Local Cuisine",
                    "price_range": "$$",
                    "rating": "4.0",
                    "address": "City Center",
                    "popular_dish": "Signature Chef Special"
                }
            ]
        }
