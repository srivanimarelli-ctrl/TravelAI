from app.ai.llm import llm
from app.ai.orchestrator.state import TravelState
from langchain_core.prompts import ChatPromptTemplate
import json

import math

from datetime import datetime, timedelta

def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1-a))

def route_node(state: TravelState) -> dict:
    print(f"--- ROUTE AGENT: Generating daily routes for {state['destination']} ---")
    days = int(state.get("days", 3))
    
    hotels = state.get("hotels", [])
    hotel_name = hotels[0].get("name", "Hotel") if hotels else "Hotel"
    
    attractions = state.get("attractions", [])
    restaurants = state.get("restaurants", [])
    
    daily_routes = []
    start_date = datetime.now() + timedelta(days=30)
    
    for i in range(days):
        current_day_date = (start_date + timedelta(days=i)).strftime("%Y-%m-%d")
        
        # 1. Filter attractions by scheduled date
        day_attractions = [a for a in attractions if a.get("scheduled_date") == current_day_date]
        
        # 2. Exclude CLOSED
        valid_attractions = [a for a in day_attractions if a.get("status") != "CLOSED"]
        
        # 3. Prioritize OPEN
        open_attractions = [a for a in valid_attractions if a.get("status") == "OPEN"]
        unknown_attractions = [a for a in valid_attractions if a.get("status") == "UNKNOWN"]
        
        attraction = {"name": "Local Walk", "lat": 0.0, "lon": 0.0, "status": "UNKNOWN"}
        
        if open_attractions:
            attraction = open_attractions[0]
        elif unknown_attractions:
            attraction = unknown_attractions[0]
        # If all attractions for this day are CLOSED, we fallback to Local Walk.
        
        # Find closest restaurant to this attraction
        best_rest = None
        min_dist = float('inf')
        
        a_lat = float(attraction.get("lat") or 0.0)
        a_lon = float(attraction.get("lon") or 0.0)
        
        for r in restaurants:
            r_lat = float(r.get("lat") or 0.0)
            r_lon = float(r.get("lon") or 0.0)
            dist = haversine(a_lat, a_lon, r_lat, r_lon)
            if dist < min_dist:
                min_dist = dist
                best_rest = r
                
        rest_name = best_rest.get("name", "Restaurant") if best_rest else "Local Restaurant"
        dist_str = f"({min_dist:.1f} km away)" if min_dist != float('inf') and min_dist > 0 else ""
        
        travel_tips = f"Restaurant is close to the attraction {dist_str}. Use local transport or walk."
        if attraction.get("status") == "UNKNOWN" and attraction.get("name") != "Local Walk":
            travel_tips += " ⚠️ WARNING: Live operational hours unavailable; please verify locally before visiting."
        
        daily_routes.append({
            "day": i + 1,
            "stops": [hotel_name, attraction.get("name", "Attraction"), rest_name],
            "travel_tips": travel_tips
        })
        
    return {
        "route_details": {
            "day_by_day_route": daily_routes
        },
        "completed_steps": state.get("completed_steps", []) + ["route"]
    }
