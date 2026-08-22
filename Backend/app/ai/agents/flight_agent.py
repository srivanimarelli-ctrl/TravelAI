import os
import json
import httpx
from app.ai.llm import llm
from app.ai.orchestrator.state import TravelState
from langchain_core.prompts import ChatPromptTemplate
from app.ai.rag.retriever import retrieve_travel_knowledge

SERPAPI_API_KEY = os.getenv("SERPAPI_API_KEY")

# Mapping popular destination names to IATA airport codes
AIRPORT_CODES = {
    "goa": "GOI",
    "jaipur": "JAI",
    "delhi": "DEL",
    "mumbai": "BOM",
    "bengaluru": "BLR",
    "bangalore": "BLR",
    "agra": "AGR",
    "varanasi": "VNS",
    "udaipur": "UDR",
    "leh": "IXL",
    "amritsar": "ATQ",
    "kerala": "COK",
    "kochi": "COK",
    "darjeeling": "IXB",
    "shimla": "SLV",
    "manali": "KUU"
}

def fetch_real_flights_serpapi(destination: str, budget: float = None):
    """
    Fetch real-time flight options using SerpApi Google Flights engine.
    Returns a list of flight dicts or None if API key missing/error occurs.
    """
    api_key = os.getenv("SERPAPI_API_KEY")
    if not api_key:
        print("--- FLIGHT AGENT: No SERPAPI_API_KEY found in environment. Using RAG/LLM. ---")
        return None
        
    dest_key = destination.lower().strip()
    arrival_code = AIRPORT_CODES.get(dest_key, "DEL")
    # Default origin to major hub (e.g. DEL or BOM)
    departure_code = "BOM" if arrival_code == "DEL" else "DEL"

    print(f"--- FLIGHT AGENT: Querying SerpApi Google Flights ({departure_code} -> {arrival_code}) ---")
    
    url = "https://serpapi.com/search.json"
    params = {
        "engine": "google_flights",
        "departure_id": departure_code,
        "arrival_id": arrival_code,
        "currency": "USD",
        "type": "2",  # One-way / Round trip
        "api_key": api_key
    }
    
    try:
        response = httpx.get(url, params=params, timeout=15.0)
        response.raise_for_status()
        data = response.json()
        
        best_flights = data.get("best_flights", []) or data.get("other_flights", [])
        if not best_flights:
            print("--- FLIGHT AGENT: No flight results returned from SerpApi. ---")
            return None
            
        formatted_flights = []
        for flight_group in best_flights[:3]:
            flight_segments = flight_group.get("flights", [])
            first_segment = flight_segments[0] if flight_segments else {}
            last_segment = flight_segments[-1] if flight_segments else {}
            
            price = flight_group.get("price", 100.0)
            airline_name = first_segment.get("airline", "Commercial Airline")
            flight_no = first_segment.get("flight_number", "FL-100")
            dep_time = first_segment.get("departure_airport", {}).get("time", "08:00 AM")
            arr_time = last_segment.get("arrival_airport", {}).get("time", "11:00 AM")
            duration_mins = flight_group.get("total_duration", 180)
            
            hours = duration_mins // 60
            mins = duration_mins % 60
            duration_str = f"{hours}h {mins}m"
            
            formatted_flights.append({
                "airline": airline_name,
                "flight_no": flight_no,
                "price": float(price),
                "departure": dep_time,
                "arrival": arr_time,
                "duration": duration_str
            })
            
        print(f"--- FLIGHT AGENT: Successfully retrieved {len(formatted_flights)} live flights from SerpApi! ---")
        return formatted_flights
        
    except Exception as e:
        print(f"--- FLIGHT AGENT: SerpApi request error: {e}. Falling back to RAG/LLM. ---")
        return None


FLIGHT_PROMPT = ChatPromptTemplate.from_messages([
    (
        "system",
        "You are a flight booking specialist assistant. Your job is to provide a list of 2-3 realistic flight options "
        "to the destination {destination} based on the overall trip outline: {planner_draft}.\n"
        "Here is some local flight knowledge retrieved from our database:\n"
        "{rag_context}\n\n"
        "Keep the prices reasonable relative to the user's total budget of {budget} dollars.\n"
        "Return ONLY a raw JSON list of objects. Each object MUST contain these keys: airline, flight_no, price, departure, arrival, duration.\n"
        "Do not include markdown wrapper, explanation, or notes. Example output:\n"
        '[{{"airline": "Indigo", "flight_no": "6E-204", "price": 150.0, "departure": "06:00 AM", "arrival": "08:30 AM", "duration": "2h 30m"}}, ...]'
    ),
    ("human", "Get flight options.")
])

def flight_node(state: TravelState) -> dict:
    print(f"--- FLIGHT AGENT: Finding flights to {state['destination']} ---")
    
    # 1. Try Live SerpApi first
    real_flights = fetch_real_flights_serpapi(state["destination"], state.get("budget"))
    if real_flights:
        return {"flights": real_flights}
    
    # 2. Fallback to ChromaDB RAG + Local Qwen LLM
    rag_context = retrieve_travel_knowledge(f"{state['destination']} flights airports airlines fares", k=2)
    
    prompt_val = FLIGHT_PROMPT.format_messages(
        destination=state["destination"],
        planner_draft=state.get("planner_draft") or "No draft outline",
        budget=state["budget"],
        rag_context=rag_context or "No specific flight database records found."
    )
    
    response = llm.invoke(prompt_val)
    
    # Strip markdown formatting if present
    content = response.content.strip()
    if content.startswith("```"):
        content = "\n".join(content.split("\n")[1:])
    if content.endswith("```"):
        content = "\n".join(content.split("\n")[:-1])
    content = content.strip()
    
    try:
        flight_data = json.loads(content)
        if not isinstance(flight_data, list):
            flight_data = [flight_data]
        return {
            "flights": flight_data
        }
    except Exception as e:
        print(f"Error parsing flight JSON: {e}")
        return {
            "flights": [
                {
                    "airline": "Standard Air",
                    "flight_no": "STD-001",
                    "price": 120.0,
                    "departure": "09:00 AM",
                    "arrival": "12:00 PM",
                    "duration": "3h 00m"
                }
            ]
        }
