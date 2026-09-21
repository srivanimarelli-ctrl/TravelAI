from app.ai.llm import llm
from app.ai.orchestrator.state import TravelState
from langchain_core.prompts import ChatPromptTemplate
from app.ai.rag.retriever import retrieve_travel_knowledge
import json

HOTEL_PROMPT = ChatPromptTemplate.from_messages([
    (
        "system",
        "You are a hotel booking specialist assistant. Your job is to provide a list of 2-3 realistic hotel/lodging options "
        "in the destination {destination} for a stay of {days} days, based on the trip outline: {planner_draft}.\n"
        "Here is some local hotel/accommodation knowledge retrieved from our database:\n"
        "{rag_context}\n\n"
        "For {currency}, keep the pricing realistic per night: for INR, quality accommodations typically range from 4500 to 14000 INR per night; for USD, 70 to 250 USD per night. "
        "Total user budget for entire trip is {budget} {currency}.\n"
        "Calculate total_cost as price_per_night * {days}.\n"
        "Return ONLY a raw JSON list of objects. Each object MUST contain these keys: name, rating, price_per_night, total_cost, address, amenities.\n"
        "Do not include markdown wrapper, explanation, or notes. Example output:\n"
        '[{{"name": "Taj Holiday Village Resort & Spa", "rating": "4.8", "price_per_night": 7500.0, "total_cost": 22500.0, "address": "Candolim, Goa", "amenities": ["Infinity Pool", "Free WiFi", "Private Beach Access", "Spa"]}}, {{"name": "Heritage Village Resort & Spa", "rating": "4.6", "price_per_night": 5500.0, "total_cost": 16500.0, "address": "Arossim Beach, Goa", "amenities": ["Pool", "Breakfast Included", "WiFi"]}}]'
    ),
    ("human", "Get hotel options.")
])

def hotel_node(state: TravelState) -> dict:
    destination = state.get("destination") or "Goa"
    days = int(state.get("days") or 3)
    currency = state.get("currency") or "INR"
    budget = float(state.get("budget") or 50000.0)

    print(f"--- HOTEL AGENT: Finding hotels in {destination} ---")
    
    # Query ChromaDB for hotel facts
    rag_context = retrieve_travel_knowledge(f"{destination} hotels lodging accommodations pricing guest houses resorts check-in", k=2)
    
    prompt_val = HOTEL_PROMPT.format_messages(
        destination=destination,
        days=days,
        currency=currency,
        planner_draft=state.get("planner_draft") or "No draft outline",
        budget=budget,
        rag_context=rag_context or "No specific hotel database records found."
    )
    
    try:
        response = llm.invoke(prompt_val)
        content = response.content.strip()
        if content.startswith("```"):
            content = "\n".join(content.split("\n")[1:])
        if content.endswith("```"):
            content = "\n".join(content.split("\n")[:-1])
        content = content.strip()
        
        hotel_data = json.loads(content)
        if not isinstance(hotel_data, list):
            hotel_data = [hotel_data]
            
        # Ensure realistic pricing fallback
        for h in hotel_data:
            if currency == "INR" and (not h.get("price_per_night") or float(h.get("price_per_night", 0)) < 1500):
                h["price_per_night"] = 6500.0
                h["total_cost"] = 6500.0 * days
            elif currency == "USD" and (not h.get("price_per_night") or float(h.get("price_per_night", 0)) < 40):
                h["price_per_night"] = 95.0
                h["total_cost"] = 95.0 * days
                
        return {"hotels": hotel_data}
    except Exception as e:
        print(f"Error parsing hotel JSON: {e}")
        nightly_rate = 6500.0 if currency == "INR" else 95.0
        return {
            "hotels": [
                {
                    "name": f"Taj Resort & Spa, {destination}",
                    "rating": "4.9",
                    "price_per_night": nightly_rate * 1.2,
                    "total_cost": (nightly_rate * 1.2) * days,
                    "address": f"Beachfront / Central, {destination}",
                    "amenities": ["Infinity Pool", "Ocean View", "Spa & Wellness", "Free WiFi"]
                },
                {
                    "name": f"Heritage Boutique Hotel, {destination}",
                    "rating": "4.7",
                    "price_per_night": nightly_rate,
                    "total_cost": nightly_rate * days,
                    "address": f"City Centre, {destination}",
                    "amenities": ["Swimming Pool", "Breakfast Included", "Free WiFi"]
                }
            ]
        }
