from app.ai.llm import llm
from app.ai.orchestrator.state import TravelState
from langchain_core.prompts import ChatPromptTemplate
import json

ROUTE_PROMPT = ChatPromptTemplate.from_messages([
    (
        "system",
        "You are a local routing and mapping specialist assistant. Your job is to organize the recommended "
        "hotels, attractions, and restaurants into a logical day-by-day sequence for a trip to {destination}.\n"
        "Input Data:\n"
        "- Selected lodging options: {hotels}\n"
        "- Sightseeing locations: {attractions}\n"
        "- Selected food spots: {restaurants}\n\n"
        "Perform these tasks:\n"
        "1. Create a sequential itinerary day-by-day (Day 1, Day 2, etc.).\n"
        "2. For each day, sequence the stops logically based on geographical proximity so the traveler doesn't backtrack.\n"
        "3. Provide directions/notes on how to travel between these spots (e.g. by walk, local cab, metro).\n\n"
        "Return ONLY a raw JSON object with these keys: day_by_day_route (a list of objects, each containing: day, stops, travel_tips).\n"
        "Do not include markdown wrapper, explanation, or notes. Example output:\n"
        '{{"day_by_day_route": [{{"day": 1, "stops": ["Sunset Beach Resort", "Aguada Fort", "Britto\'s Restaurant"], "travel_tips": "Fort is a 15-minute cab ride from the resort; restaurant is walking distance from the beach."}}, ...]}}'
    ),
    ("human", "Generate route and daily schedule.")
])

def route_node(state: TravelState) -> dict:
    print(f"--- ROUTE AGENT: Generating daily routes for {state['destination']} ---")
    
    prompt_val = ROUTE_PROMPT.format_messages(
        destination=state["destination"],
        hotels=json.dumps(state.get("hotels") or []),
        attractions=json.dumps(state.get("attractions") or []),
        restaurants=json.dumps(state.get("restaurants") or [])
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
        route_data = json.loads(content)
        return {
            "route_details": route_data,
            "completed_steps": state.get("completed_steps", []) + ["route"]
        }
    except Exception as e:
        print(f"Error parsing route JSON: {e}")
        # Fail-safe default route details
        return {
            "route_details": {
                "day_by_day_route": [
                    {
                        "day": i,
                        "stops": [
                            state.get("hotels", [{"name": "Hotel"}])[0].get("name", "Hotel"),
                            state.get("attractions", [{"name": "Attraction"}])[0].get("name", "Attraction"),
                            state.get("restaurants", [{"name": "Restaurant"}])[0].get("name", "Restaurant")
                        ],
                        "travel_tips": "Use local transport or walk."
                    }
                    for i in range(1, int(state.get("days", 3)) + 1)
                ]
            },
            "error_logs": state.get("error_logs", []) + [f"Route generation error: {str(e)}"],
            "completed_steps": state.get("completed_steps", []) + ["route"]
        }
