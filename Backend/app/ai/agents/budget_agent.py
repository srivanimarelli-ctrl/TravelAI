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
        "- Number of travelers: {travelers} travelers\n"
        "- Budget Mode: {budget_mode}\n"
        "- Travel Style: {travel_style}\n"
        "- Currency: {currency}\n"
        "- Trip duration: {days} days\n"
        "- Flight options: {flights}\n"
        "- Hotel options: {hotels}\n"
        "- Attractions options: {attractions}\n\n"
        "Perform these tasks:\n"
        "1. Calculate total flight cost for {travelers} travelers.\n"
        "2. Calculate total hotel cost for {days} days (or nights).\n"
        "3. Allocate realistic gastronomy and dining expenses for {travelers} travelers over {days} days.\n"
        "4. Allocate activities, tours, and sightseeing expenses for {travelers} travelers.\n"
        "5. Calculate safety buffer / unallocated reserve (budget - total_expenses).\n"
        "Return ONLY a raw JSON object with keys: flight_cost, hotel_cost, gastronomy_cost, activities_cost, unallocated_buffer, total_trip_cost, remaining_budget, is_under_budget.\n"
        "Do not include markdown wrapper, explanation, or notes. Example output:\n"
        '{{"flight_cost": 13500.0, "hotel_cost": 27000.0, "gastronomy_cost": 14000.0, "activities_cost": 8500.0, "unallocated_buffer": 7000.0, "total_trip_cost": 63000.0, "remaining_budget": 7000.0, "is_under_budget": true}}'
    ),
    ("human", "Calculate trip budget breakdown.")
])

def budget_node(state: TravelState) -> dict:
    currency = state.get("currency", "INR")
    budget_mode = state.get("budget_mode", "FIXED")
    travel_style = state.get("travel_style", "STANDARD")
    user_budget = float(state.get("budget") or (70000.0 if currency == "INR" else 1000.0))
    travelers = int(state.get("travelers") or 2)
    days = int(state.get("days") or 3)
    
    print(f"--- BUDGET AGENT: Calculating expenses for {state.get('destination')} ({travelers} travelers, budget {user_budget} {currency}) ---")
    
    prompt_val = BUDGET_PROMPT.format_messages(
        budget=user_budget,
        currency=currency,
        travelers=travelers,
        budget_mode=budget_mode,
        travel_style=travel_style,
        days=days,
        flights=json.dumps(state.get("flights") or []),
        hotels=json.dumps(state.get("hotels") or []),
        attractions=json.dumps(state.get("attractions") or [])
    )
    
    try:
        response = llm.invoke(prompt_val)
        content = response.content.strip()
        if content.startswith("```"):
            content = "\n".join(content.split("\n")[1:])
        if content.endswith("```"):
            content = "\n".join(content.split("\n")[:-1])
        content = content.strip()
        
        budget_data = json.loads(content)
        
        flight_cost = float(budget_data.get("flight_cost") or round(user_budget * 0.25, 2))
        hotel_cost = float(budget_data.get("hotel_cost") or round(user_budget * 0.40, 2))
        gastronomy_cost = float(budget_data.get("gastronomy_cost") or round(user_budget * 0.18, 2))
        activities_cost = float(budget_data.get("activities_cost") or round(user_budget * 0.10, 2))
        total_exp = flight_cost + hotel_cost + gastronomy_cost + activities_cost
        unallocated_buffer = max(0.0, round(user_budget - total_exp, 2))
        
        budget_data["flight_cost"] = flight_cost
        budget_data["hotel_cost"] = hotel_cost
        budget_data["gastronomy_cost"] = gastronomy_cost
        budget_data["activities_cost"] = activities_cost
        budget_data["unallocated_buffer"] = unallocated_buffer
        budget_data["total_trip_cost"] = total_exp
        budget_data["remaining_budget"] = unallocated_buffer
        budget_data["is_under_budget"] = total_exp <= user_budget
        budget_data["travelers"] = travelers
        budget_data["currency"] = currency
        budget_data["totalBudget"] = user_budget

        return {
            "budget_breakdown": budget_data,
            "completed_steps": state.get("completed_steps", []) + ["flights", "hotels", "weather", "attractions", "restaurants", "budget"]
        }
    except Exception as e:
        print(f"Error parsing budget JSON: {e}")
        flight_cost = round(user_budget * 0.25, 2)
        hotel_cost = round(user_budget * 0.40, 2)
        gastronomy_cost = round(user_budget * 0.18, 2)
        activities_cost = round(user_budget * 0.10, 2)
        total_exp = flight_cost + hotel_cost + gastronomy_cost + activities_cost
        unallocated_buffer = max(0.0, round(user_budget - total_exp, 2))
        
        return {
            "budget_breakdown": {
                "flight_cost": flight_cost,
                "hotel_cost": hotel_cost,
                "gastronomy_cost": gastronomy_cost,
                "activities_cost": activities_cost,
                "unallocated_buffer": unallocated_buffer,
                "total_trip_cost": total_exp,
                "remaining_budget": unallocated_buffer,
                "is_under_budget": True,
                "travelers": travelers,
                "currency": currency,
                "totalBudget": user_budget
            },
            "error_logs": state.get("error_logs", []) + [f"Budget calculation error: {str(e)}"],
            "completed_steps": state.get("completed_steps", []) + ["flights", "hotels", "weather", "attractions", "restaurants", "budget"]
        }
