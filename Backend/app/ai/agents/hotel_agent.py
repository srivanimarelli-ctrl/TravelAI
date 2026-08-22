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
        "Keep the total pricing (price_per_night * {days}) reasonable relative to the user's total budget of {budget} dollars.\n"
        "Return ONLY a raw JSON list of objects. Each object MUST contain these keys: name, rating, price_per_night, total_cost, address, amenities.\n"
        "Do not include markdown wrapper, explanation, or notes. Example output:\n"
        '[{{"name": "Sunset Beach Resort", "rating": "4.5", "price_per_night": 120.0, "total_cost": 360.0, "address": "Calangute, Goa", "amenities": ["Pool", "Free WiFi", "Beach Access"]}}, ...]'
    ),
    ("human", "Get hotel options.")
])

def hotel_node(state: TravelState) -> dict:
    print(f"--- HOTEL AGENT: Finding hotels in {state['destination']} ---")
    
    # Query ChromaDB for hotel facts
    rag_context = retrieve_travel_knowledge(f"{state['destination']} hotels lodging accommodations pricing guest houses resorts check-in", k=2)
    
    prompt_val = HOTEL_PROMPT.format_messages(
        destination=state["destination"],
        days=state["days"],
        planner_draft=state.get("planner_draft") or "No draft outline",
        budget=state["budget"],
        rag_context=rag_context or "No specific hotel database records found."
    )
    
    response = llm.invoke(prompt_val)
    
    # Strip any markdown formatting (like ```json ... ```) just in case the LLM includes it
    content = response.content.strip()
    if content.startswith("```"):
        content = "\n".join(content.split("\n")[1:])
    if content.endswith("```"):
        content = "\n".join(content.split("\n")[:-1])
    content = content.strip()
    
    try:
        hotel_data = json.loads(content)
        # Ensure it is a list
        if not isinstance(hotel_data, list):
            hotel_data = [hotel_data]
        return {
            "hotels": hotel_data
        }
    except Exception as e:
        print(f"Error parsing hotel JSON: {e}")
        # Fail-safe default hotel option
        default_cost = 100.0 * float(state.get("days", 3))
        return {
            "hotels": [
                {
                    "name": "Standard Inn",
                    "rating": "3.5",
                    "price_per_night": 100.0,
                    "total_cost": default_cost,
                    "address": f"Central Area, {state['destination']}",
                    "amenities": ["Clean Rooms", "WiFi"]
                }
            ]
        }
