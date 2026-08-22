from app.ai.llm import llm
from app.ai.orchestrator.state import TravelState
from langchain_core.prompts import ChatPromptTemplate

PLANNER_PROMPT = ChatPromptTemplate.from_messages([
    (
        "system",
        "You are an expert travel planner. Your task is to draft a day-by-day travel outline draft for a trip to {destination} for {days} days with a budget of {budget} dollars. The user's preferences are: {preferences}.\n"
        "Provide a structured day-by-day draft of activities, noting what kinds of flights, hotels, and attractions the other specialist agents should search for. Keep it concise, professional, and clear."
    ),
    ("human", "Draft my trip itinerary outline.")
])

def planner_node(state: TravelState) -> dict:
    print(f"--- PLANNER AGENT: Drafting itinerary for {state['destination']} ---")
    
    # Format the prompt using variables from the shared state
    prompt_val = PLANNER_PROMPT.format_messages(
        destination=state["destination"],
        days=state["days"],
        budget=state["budget"],
        preferences=state.get("preferences") or "None"
    )
    
    # Run the Qwen model
    response = llm.invoke(prompt_val)
    
    # Return the dictionary to update the shared state
    return {
        "planner_draft": response.content,
        "completed_steps": state.get("completed_steps", []) + ["planner"]
    }
