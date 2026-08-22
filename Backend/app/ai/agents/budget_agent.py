from app.ai.llm import llm
from app.ai.orchestrator.state import TravelState
from langchain_core.prompts import ChatPromptTemplate
import json

BUDGET_PROMPT = ChatPromptTemplate.from_messages([
    (
        "system",
        "You are a travel financial auditor assistant. Your job is to calculate and audit the expenses of the trip.\n"
        "Input Data:\n"
        "- Total User Budget limit: {budget} dollars\n"
        "- Trip duration: {days} days\n"
        "- Flight options: {flights}\n"
        "- Hotel options: {hotels}\n"
        "- Attractions options: {attractions}\n\n"
        "Perform these tasks:\n"
        "1. Assume the traveler picks the first option of flights and hotels for calculation.\n"
        "2. Calculate the total cost of flights, hotels (price * days), and sum them up.\n"
        "3. Allocate a reasonable daily expense estimate for food and local transport ($50/day standard unless budget is very tight).\n"
        "4. Calculate the total trip cost and see how much remains of the user's budget.\n\n"
        "Return ONLY a raw JSON object with these keys: flight_cost, hotel_cost, daily_expenses_total, total_trip_cost, remaining_budget, is_under_budget.\n"
        "Do not include markdown wrapper, explanation, or notes. Example output:\n"
        '{{"flight_cost": 300.0, "hotel_cost": 400.0, "daily_expenses_total": 150.0, "total_trip_cost": 850.0, "remaining_budget": 150.0, "is_under_budget": true}}'
    ),
    ("human", "Calculate trip budget breakdown.")
])

def budget_node(state: TravelState) -> dict:
    print(f"--- BUDGET AGENT: Calculating expenses for {state['destination']} ---")
    
    prompt_val = BUDGET_PROMPT.format_messages(
        budget=state["budget"],
        days=state["days"],
        flights=json.dumps(state.get("flights") or []),
        hotels=json.dumps(state.get("hotels") or []),
        attractions=json.dumps(state.get("attractions") or [])
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
        budget_data = json.loads(content)
        return {
            "budget_breakdown": budget_data,
            "completed_steps": state.get("completed_steps", []) + ["flights", "hotels", "weather", "attractions", "restaurants", "budget"]
        }
    except Exception as e:
        print(f"Error parsing budget JSON: {e}")
        # Fail-safe default budget breakdown
        return {
            "budget_breakdown": {
                "flight_cost": 0.0,
                "hotel_cost": 0.0,
                "daily_expenses_total": 0.0,
                "total_trip_cost": 0.0,
                "remaining_budget": float(state["budget"]),
                "is_under_budget": True
            },
            "error_logs": state.get("error_logs", []) + [f"Budget calculation error: {str(e)}"],
            "completed_steps": state.get("completed_steps", []) + ["flights", "hotels", "weather", "attractions", "restaurants", "budget"]
        }
