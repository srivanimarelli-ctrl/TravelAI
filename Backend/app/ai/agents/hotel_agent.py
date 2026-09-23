import os
import json
import httpx
from datetime import datetime, timedelta
from app.ai.llm import llm
from app.ai.orchestrator.state import TravelState
from app.ai.rag.retriever import retrieve_travel_knowledge

def get_fallback_hotel(destination: str, days: int, currency: str) -> dict:
    # Query ChromaDB for hotel facts
    rag_context = retrieve_travel_knowledge(f"{destination} hotels lodging accommodations pricing guest houses resorts check-in", k=2)
    nightly_rate = 6500.0 if currency == "INR" else 95.0
    
    return {
        "name": f"Historical Hotel Knowledge ({destination})",
        "rating": "4.5",
        "price_per_night": nightly_rate,
        "total_cost": nightly_rate * days,
        "address": f"Historical Knowledge Suggestion",
        "amenities": ["Based on RAG context", "Historical Pricing"],
        "rag_context": rag_context[:500] if rag_context else "No specific hotel database records found."
    }

def hotel_node(state: TravelState) -> dict:
    destination = state.get("destination") or "Goa"
    days = int(state.get("days") or 3)
    currency = state.get("currency") or "INR"

    print(f"--- HOTEL AGENT: Finding real-time hotels in {destination} ---")

    api_key = os.getenv("SERPAPI_API_KEY")
    hotels = []

    if api_key:
        try:
            # Set check_in to 30 days from now, and check_out based on 'days'
            check_in_date = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
            check_out_date = (datetime.now() + timedelta(days=30 + days)).strftime("%Y-%m-%d")

            params = {
                "engine": "google_hotels",
                "q": destination,
                "check_in_date": check_in_date,
                "check_out_date": check_out_date,
                "adults": "2",
                "currency": currency,
                "api_key": api_key
            }

            response = httpx.get("https://serpapi.com/search.json", params=params, timeout=10.0)
            response.raise_for_status()
            data = response.json()

            properties = data.get("properties", [])
            for prop in properties[:3]:  # Get up to 3 hotels
                price_per_night = prop.get("rate_per_night", {}).get("extracted_lowest") or 0.0
                total_cost = price_per_night * days
                
                # Extract image
                image_url = ""
                images = prop.get("images", [])
                if images:
                    image_url = images[0].get("original_image") or images[0].get("thumbnail") or ""
                
                hotel = {
                    "name": prop.get("name", f"Hotel in {destination}"),
                    "rating": str(prop.get("overall_rating", "4.0")),
                    "price_per_night": float(price_per_night),
                    "total_cost": float(total_cost),
                    "address": destination, # SerpAPI google_hotels doesn't typically return a full address object here
                    "amenities": prop.get("amenities", [])[:4],
                    "imageUrl": image_url
                }
                hotels.append(hotel)

        except Exception as e:
            print(f"--- HOTEL AGENT: SerpAPI failed ({e}), falling back to RAG ---")

    # Fallback to RAG if SerpAPI failed or returned no hotels
    if not hotels:
        hotels.append(get_fallback_hotel(destination, days, currency))

    return {
        "hotels": hotels
    }
