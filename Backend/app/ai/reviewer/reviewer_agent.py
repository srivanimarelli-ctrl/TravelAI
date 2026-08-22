from app.ai.llm import llm
from app.ai.orchestrator.state import TravelState
from langchain_core.prompts import ChatPromptTemplate
import json

REVIEWER_PROMPT = ChatPromptTemplate.from_messages([
    (
        "system",
        "You are the senior trip auditor and quality reviewer. Your job is to check the generated trip plan and approve it "
        "only if it strictly satisfies the user's constraints.\n"
        "User Constraints:\n"
        "- Destination: {destination}\n"
        "- Days: {days}\n"
        "- Budget limit: {budget} dollars\n"
        "- User preferences: {preferences}\n\n"
        "Generated Plan Details:\n"
        "- Draft outline: {planner_draft}\n"
        "- Flight details: {flights}\n"
        "- Hotel details: {hotels}\n"
        "- Weather forecast: {weather}\n"
        "- Attractions selected: {attractions}\n"
        "- Budget breakdown audit: {budget_breakdown}\n"
        "- Sequenced daily routes: {route_details}\n\n"
        "Verify these conditions:\n"
        "1. Is the total cost from the budget breakdown under the budget limit?\n"
        "2. Do the flights and hotels match the destination?\n"
        "3. Does the daily route make practical sense?\n\n"
        "Return ONLY a raw JSON object with these keys: is_approved, reviewer_feedback.\n"
        "If approved, is_approved is true, and reviewer_feedback is 'Approved'.\n"
        "If rejected, is_approved is false, and reviewer_feedback is a list of changes needed (e.g. 'Flight too expensive').\n"
        "Do not include markdown wrapper, explanation, or notes. Example output:\n"
        '{{"is_approved": true, "reviewer_feedback": "Approved"}}'
    ),
    ("human", "Audit and review the final travel itinerary.")
])

def reviewer_node(state: TravelState) -> dict:
    print(f"--- REVIEWER AGENT: Auditing final trip plan for {state['destination']} ---")
    
    prompt_val = REVIEWER_PROMPT.format_messages(
        destination=state["destination"],
        days=state["days"],
        budget=state["budget"],
        preferences=state.get("preferences") or "None",
        planner_draft=state.get("planner_draft") or "None",
        flights=json.dumps(state.get("flights") or []),
        hotels=json.dumps(state.get("hotels") or []),
        weather=json.dumps(state.get("weather") or {}),
        attractions=json.dumps(state.get("attractions") or []),
        budget_breakdown=json.dumps(state.get("budget_breakdown") or {}),
        route_details=json.dumps(state.get("route_details") or {})
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
        review_data = json.loads(content)
        return {
            "is_approved": bool(review_data.get("is_approved", False)),
            "reviewer_feedback": review_data.get("reviewer_feedback", "Needs revision"),
            "completed_steps": state.get("completed_steps", []) + ["reviewer"]
        }
    except Exception as e:
        print(f"Error parsing reviewer JSON: {e}")
        # Fail-safe review: default to False if we couldn't parse review
        return {
            "is_approved": False,
            "reviewer_feedback": f"Review failed due to output parsing error: {str(e)}",
            "completed_steps": state.get("completed_steps", []) + ["reviewer"]
        }
