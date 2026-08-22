import json
from app.ai.llm import llm
from app.ai.orchestrator.state import TravelState
from langchain_core.prompts import ChatPromptTemplate

PARSER_PROMPT = ChatPromptTemplate.from_messages([
    (
        "system",
        "You are an AI assistant that extracts travel planning variables from raw text. "
        "Your task is to extract the destination, number of days, budget, and other preferences. "
        "If a variable is not mentioned, use these default values:\n"
        "- days: 3\n"
        "- budget: 500.0\n"
        "Return ONLY a raw JSON object with these keys: destination, days, budget, preferences. "
        "Do not include markdown wrapper, explanation, or notes. Example output:\n"
        '{{"destination": "Goa", "days": 3, "budget": 500.0, "preferences": "2 people"}}'
    ),
    ("human", "Extract from this request: {user_message}")
])

def parser_node(state: TravelState) -> dict:
    # If we already have the variables (Form path), skip parsing
    if state.get("destination") and state.get("days") and state.get("budget"):
        print("--- PARSER AGENT: Skip (Form input already structured) ---")
        return {"completed_steps": state.get("completed_steps", []) + ["parser"]}
        
    print(f"--- PARSER AGENT: Extracting from message: '{state.get('user_message')}' ---")
    
    prompt_val = PARSER_PROMPT.format_messages(user_message=state["user_message"])
    response = llm.invoke(prompt_val)
    
    # Parse the JSON response
    try:
        data = json.loads(response.content.strip())
        return {
            "destination": data.get("destination"),
            "days": int(data.get("days", 3)),
            "budget": float(data.get("budget", 500.0)),
            "preferences": data.get("preferences"),
            "completed_steps": state.get("completed_steps", []) + ["parser"]
        }
    except Exception as e:
        print(f"Error parsing Qwen response: {e}")
        # Fail-safe defaults
        return {
            "destination": "Unknown",
            "days": 3,
            "budget": 500.0,
            "error_logs": state.get("error_logs", []) + [f"Parser error: {str(e)}"],
            "completed_steps": state.get("completed_steps", []) + ["parser"]
        }
