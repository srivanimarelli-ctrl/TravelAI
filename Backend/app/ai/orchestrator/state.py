from typing import TypedDict, List, Dict, Any, Optional

class TravelState(TypedDict):
    # Chat Input (Only used if the user uses the Chat UI)
    user_message: Optional[str]
    
    # User Inputs (Provided directly by Form UI, or extracted by Parser for Chat UI)
    destination: Optional[str]
    days: Optional[int]
    budget: Optional[float]
    preferences: Optional[str]
    
    # Agent Outputs
    planner_draft: Optional[str]
    flights: Optional[List[Dict[str, Any]]]
    hotels: Optional[List[Dict[str, Any]]]
    weather: Optional[Dict[str, Any]]
    attractions: Optional[List[Dict[str, Any]]]
    restaurants: Optional[List[Dict[str, Any]]]
    route_details: Optional[Dict[str, Any]]
    budget_breakdown: Optional[Dict[str, Any]]
    
    # Reviewer Output
    reviewer_feedback: Optional[str]
    is_approved: bool
    
    # Execution Tracking
    completed_steps: List[str]
    error_logs: Optional[List[str]]

