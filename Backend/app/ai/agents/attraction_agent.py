import json
import httpx
from app.ai.llm import llm
from app.ai.orchestrator.state import TravelState
from langchain_core.prompts import ChatPromptTemplate
from app.ai.rag.retriever import retrieve_travel_knowledge

OVERPASS_API_URL = "https://overpass-api.de/api/interpreter"

# Coordinates map for Indian travel destinations
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

def fetch_real_attractions_overpass(destination: str):
    """
    Fetch real-time tourist attractions, museums, and historical landmarks from OpenStreetMap Overpass API.
    Returns a list of attraction dicts or None on failure.
    """
    dest_key = destination.lower().strip()
    coords = CITY_COORDINATES.get(dest_key)
    if not coords:
        return None

    print(f"--- ATTRACTION AGENT: Querying Overpass OpenStreetMap API for '{destination}' ({coords['lat']}, {coords['lon']}) ---")
    
    # Overpass QL query: find attractions, museums, historic forts, monuments, and viewpoints within 8000m
    overpass_query = f"""
    [out:json][timeout:15];
    (
      node["tourism"="attraction"](around:8000, {coords['lat']}, {coords['lon']});
      node["tourism"="museum"](around:8000, {coords['lat']}, {coords['lon']});
      node["tourism"="viewpoint"](around:8000, {coords['lat']}, {coords['lon']});
      node["historic"="monument"](around:8000, {coords['lat']}, {coords['lon']});
      node["historic"="castle"](around:8000, {coords['lat']}, {coords['lon']});
      node["historic"="fort"](around:8000, {coords['lat']}, {coords['lon']});
    );
    out center 20;
    """
    
    headers = {
        "User-Agent": "TravelAI_AttractionBot/1.0 (contact: dev@travelai.local)",
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
            print("--- ATTRACTION AGENT: No attraction elements found from Overpass API. ---")
            return None
            
        formatted_attractions = []
        for element in elements:
            tags = element.get("tags", {})
            name = tags.get("name")
            if not name:
                continue # Skip unnamed landmarks
                
            # Build description from available OSM tags
            historic_type = tags.get("historic", "")
            tourism_type = tags.get("tourism", "tourist spot")
            description = tags.get("description")
            
            if not description:
                if historic_type:
                    description = f"Historical {historic_type.title()} in {destination.title()} known for its architecture and heritage."
                elif tourism_type == "museum":
                    description = f"Renowned cultural museum showcasing regional artifacts and exhibits."
                elif tourism_type == "viewpoint":
                    description = f"Scenic scenic viewpoint offering panoramic views of {destination.title()}."
                else:
                    description = f"Must-visit landmark and popular tourist destination in {destination.title()}."
                    
            # Estimate time to spend and fee
            fee = tags.get("fee", "no")
            entrance_fee = 3.0 if fee == "yes" else 0.0
            time_spent = "1.5 hours" if tourism_type in ["museum", "attraction"] else "1 hour"

            formatted_attractions.append({
                "name": name,
                "description": description,
                "entrance_fee": entrance_fee,
                "rating": "4.5",
                "recommended_time_spent": time_spent,
                "lat": element.get("lat") or coords["lat"],
                "lon": element.get("lon") or coords["lon"]
            })
            
            if len(formatted_attractions) >= 5:
                break
                
        if formatted_attractions:
            print(f"--- ATTRACTION AGENT: Successfully retrieved {len(formatted_attractions)} live attractions from OpenStreetMap! ---")
            return formatted_attractions
        return None
        
    except Exception as e:
        print(f"--- ATTRACTION AGENT: Overpass API error: {e}. Falling back to RAG/LLM. ---")
        return None


def attraction_node(state: TravelState) -> dict:
    print(f"--- ATTRACTION AGENT: Finding attractions in {state['destination']} ---")
    
    # 1. Try Live OpenStreetMap Overpass API first
    live_attractions = fetch_real_attractions_overpass(state["destination"])
    if live_attractions:
        return {"attractions": live_attractions}
    
    # 2. Fallback to deterministic static attraction list
    print(f"--- ATTRACTION AGENT: Using default deterministic attractions for {state['destination']} ---")
    return {
        "attractions": [
            {
                "name": f"Famous City Center of {state['destination']}",
                "description": "Historical square and shopping streets.",
                "entrance_fee": 0.0,
                "rating": "4.0",
                "recommended_time_spent": "3 hours",
                "lat": 0.0,
                "lon": 0.0
            }
        ]
    }
