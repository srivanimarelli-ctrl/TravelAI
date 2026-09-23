from app.ai.llm import llm
from app.ai.orchestrator.state import TravelState
from langchain_core.prompts import ChatPromptTemplate
import json

SYNTHESIS_PROMPT = ChatPromptTemplate.from_messages([
    (
        "system",
        "You are the final travel concierge. Your job is to take the validated, structured travel data and write a short, engaging welcome summary for the user.\n"
        "Input Data:\n"
        "- Destination: {destination}\n"
        "- Days: {days}\n"
        "- Budget: {budget}\n"
        "- Weather summary: {weather}\n"
        "- Total Trip Cost: {total_cost}\n\n"
        "Write a warm, 2-3 paragraph summary welcoming them to their trip. Do not generate JSON. Write plain text (markdown is allowed)."
    ),
    ("human", "Synthesize final itinerary.")
])

def synthesis_node(state: TravelState) -> dict:
    print(f"--- SYNTHESIS AGENT: Generating final summary for {state.get('destination')} ---")
    
    budget_breakdown = state.get("budget_breakdown") or {}
    total_cost = budget_breakdown.get("total_trip_cost", "Unknown")
    
    weather = state.get("weather") or {}
    weather_summary = weather.get("summary", "Unknown weather")
    
    prompt_val = SYNTHESIS_PROMPT.format_messages(
        destination=state.get("destination", "Destination"),
        days=state.get("days", 3),
        budget=state.get("budget", 50000.0),
        weather=weather_summary,
        total_cost=total_cost
    )
    
    try:
        response = llm.invoke(prompt_val)
        summary = response.content.strip()
    except Exception as e:
        print(f"Synthesis LLM error: {e}")
        summary = f"Welcome to your trip to {state.get('destination')}! We've prepared all the details for you below."
        
    return {
        "final_itinerary": summary,
        "completed_steps": state.get("completed_steps", []) + ["synthesis"]
    }
