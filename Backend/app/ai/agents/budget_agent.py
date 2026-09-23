from app.ai.llm import llm
from app.ai.orchestrator.state import TravelState
from langchain_core.prompts import ChatPromptTemplate
import json

def budget_node(state: TravelState) -> dict:
    currency = state.get("currency", "INR")
    user_budget = float(state.get("budget") or (70000.0 if currency == "INR" else 1000.0))
    travelers = int(state.get("travelers") or 2)
    
    print(f"--- BUDGET AGENT: Calculating expenses for {state.get('destination')} ({travelers} travelers, budget {user_budget} {currency}) ---")
    
    flights = state.get("flights") or []
    flight_cost = float(flights[0].get("price", 0)) * travelers * 2 if flights else 0.0
    
    hotels = state.get("hotels") or []
    hotel_cost = float(hotels[0].get("total_cost", 0)) if hotels else 0.0
    
    attractions = state.get("attractions") or []
    activities_cost = sum(float(a.get("entrance_fee", 0)) for a in attractions if "entrance_fee" in a) * travelers
    
    gastronomy_cost = 0.0
    
    total_exp = flight_cost + hotel_cost + activities_cost + gastronomy_cost
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
            "is_under_budget": total_exp <= user_budget,
            "travelers": travelers,
            "currency": currency,
            "totalBudget": user_budget,
            "notes": "Gastronomy and transport costs unavailable due to lack of reliable numeric data."
        },
        "completed_steps": state.get("completed_steps", []) + ["flights", "hotels", "weather", "attractions", "restaurants", "budget"]
    }
