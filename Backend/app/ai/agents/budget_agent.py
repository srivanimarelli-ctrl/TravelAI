from app.ai.llm import llm
from app.ai.orchestrator.state import TravelState
from langchain_core.prompts import ChatPromptTemplate
import json

BUDGET_PROMPT = ChatPromptTemplate.from_messages([
    (
        "system",
        "You are a travel financial auditor assistant. Your job is to calculate and audit the expenses of the trip.\n"
        "Input Data:\n"
        "- Total User Budget limit: {budget} {currency}\n"
        "- Budget Mode: {budget_mode}\n"
        "- Travel Style: {travel_style}\n"
        "- Currency: {currency}\n"
        "- Trip duration: {days} days\n"
        "- Flight options: {flights}\n"
        "- Hotel options: {hotels}\n"
        "- Attractions options: {attractions}\n\n"
        "Perform these tasks:\n"
        "1. Assume the traveler picks the first option of flights and hotels for calculation.\n"
        "2. Calculate the total cost of flights and hotels (price_per_night * days if hotel price is per night, or total_cost).\n"
        "3. Allocate a realistic daily expense estimate for food and local transport in {currency} based on travel style.\n"
        "4. Calculate total_trip_cost.\n"
        "5. Budget semantics:\n"
        "   - If budget_mode is FIXED: remaining_budget = budget - total_trip_cost, is_under_budget = total_trip_cost <= budget.\n"
        "   - If budget_mode is FLEXIBLE or ECONOMY or PREMIUM: report total_trip_cost and estimated remaining_budget, is_under_budget = True.\n"
        "   - If budget_mode is NO_LIMIT or LUXURY: remaining_budget = 0.0, is_under_budget = True (no spending ceiling).\n\n"
        "Return ONLY a raw JSON object with these keys: flight_cost, hotel_cost, daily_expenses_total, total_trip_cost, remaining_budget, is_under_budget.\n"
        "Do not include markdown wrapper, explanation, or notes. Example output:\n"
        '{{"flight_cost": 3000.0, "hotel_cost": 8000.0, "daily_expenses_total": 4000.0, "total_trip_cost": 15000.0, "remaining_budget": 5000.0, "is_under_budget": true}}'
    ),
    ("human", "Calculate trip budget breakdown.")
])

def budget_node(state: TravelState) -> dict:
    print(f"--- BUDGET AGENT: Calculating expenses for {state['destination']} ---")
    
    currency = state.get("currency", "INR")
    budget_mode = state.get("budget_mode", "FIXED")
    travel_style = state.get("travel_style", "STANDARD")
    user_budget = float(state.get("budget") or 500.0)
    
    prompt_val = BUDGET_PROMPT.format_messages(
        budget=user_budget,
        currency=currency,
        budget_mode=budget_mode,
        travel_style=travel_style,
        days=state.get("days", 3),
        flights=json.dumps(state.get("flights") or []),
        hotels=json.dumps(state.get("hotels") or []),
        attractions=json.dumps(state.get("attractions") or [])
    )
    
    response = llm.invoke(prompt_val)
    
    content = response.content.strip()
    if content.startswith("```"):
        content = "\n".join(content.split("\n")[1:])
    if content.endswith("```"):
        content = "\n".join(content.split("\n")[:-1])
    content = content.strip()
    
    try:
        budget_data = json.loads(content)
        
        # Override budget semantics enforcement deterministically if LLM hallucinates logic
        if budget_mode in ["NO_LIMIT", "LUXURY"]:
            budget_data["is_under_budget"] = True
            budget_data["remaining_budget"] = 0.0
        elif budget_mode == "FIXED" and user_budget > 0:
            total = float(budget_data.get("total_trip_cost", 0.0))
            budget_data["remaining_budget"] = round(user_budget - total, 2)
            budget_data["is_under_budget"] = total <= user_budget

        return {
            "budget_breakdown": budget_data,
            "completed_steps": state.get("completed_steps", []) + ["flights", "hotels", "weather", "attractions", "restaurants", "budget"]
        }
    except Exception as e:
        print(f"Error parsing budget JSON: {e}")
        return {
            "budget_breakdown": {
                "flight_cost": 0.0,
                "hotel_cost": 0.0,
                "daily_expenses_total": 0.0,
                "total_trip_cost": 0.0,
                "remaining_budget": user_budget,
                "is_under_budget": True
            },
            "error_logs": state.get("error_logs", []) + [f"Budget calculation error: {str(e)}"],
            "completed_steps": state.get("completed_steps", []) + ["flights", "hotels", "weather", "attractions", "restaurants", "budget"]
        }
