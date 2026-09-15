from langgraph.graph import StateGraph, END
from app.ai.orchestrator.state import TravelState

# Import all agent nodes
from app.ai.orchestrator.parser_agent import parser_node
from app.ai.orchestrator.planner_agent import planner_node
from app.ai.agents.weather_agent import weather_node
from app.ai.agents.flight_agent import flight_node
from app.ai.agents.hotel_agent import hotel_node
from app.ai.agents.attraction_agent import attraction_node
from app.ai.agents.restaurant_agent import restaurant_node
from app.ai.agents.budget_agent import budget_node
from app.ai.agents.route_agent import route_node
from app.ai.reviewer.reviewer_agent import reviewer_node

# Initialize the StateGraph with our TravelState schema
workflow = StateGraph(TravelState)

# 1. Add all agents as graph nodes
workflow.add_node("parser", parser_node)
workflow.add_node("planner", planner_node)
workflow.add_node("weather", weather_node)
workflow.add_node("flights", flight_node)
workflow.add_node("hotels", hotel_node)
workflow.add_node("attractions", attraction_node)
workflow.add_node("restaurants", restaurant_node)
workflow.add_node("budget", budget_node)
workflow.add_node("route", route_node)
workflow.add_node("reviewer", reviewer_node)

# 2. Define the execution edges
workflow.set_entry_point("parser")

# Parser runs first, then handoff to Planner
workflow.add_edge("parser", "planner")

# Planner kicks off the 5 parallel specialist nodes
workflow.add_edge("planner", "flights")
workflow.add_edge("planner", "hotels")
workflow.add_edge("planner", "weather")
workflow.add_edge("planner", "attractions")
workflow.add_edge("planner", "restaurants")

# All par
# allel agents join back at the Budget Auditor node
workflow.add_edge("flights", "budget")
workflow.add_edge("hotels", "budget")
workflow.add_edge("weather", "budget")
workflow.add_edge("attractions", "budget")
workflow.add_edge("restaurants", "budget")

# Budget Node connects to Route Node, then to Reviewer Node
workflow.add_edge("budget", "route")
workflow.add_edge("route", "reviewer")

# 3. Define the conditional routing edge from the Reviewer
def should_continue(state: TravelState):
    if state.get("is_approved") is True:
        print("--- GRAPH ORCHESTRATION: Itinerary APPROVED! Ending workflow. ---")
        return "approved"
    else:
        # Check if we have looped too many times to prevent infinite loops
        loops = state.get("completed_steps", []).count("planner")
        if loops >= 3:
            print("--- GRAPH ORCHESTRATION: Loop limit reached (3). Ending workflow. ---")
            return "approved" # Force exit if stuck
            
        print(f"--- GRAPH ORCHESTRATION: Itinerary REJECTED (Loop {loops}). Re-routing to Planner. ---")
        return "rejected"

# Setup the routing logic: approved goes to END, rejected goes back to planner
workflow.add_conditional_edges(
    "reviewer",
    should_continue,
    {
        "approved": END,
        "rejected": "planner"
    }
)

# Compile the graph
graph = workflow.compile()
