from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class TripModel(BaseModel):
    id: Optional[str] = Field(None, alias="_id") # MongoDB ID
    user_message: Optional[str] = None
    destination: str
    days: int
    budget: float
    preferences: Optional[str] = None
    
    # Generated Itinerary
    planner_draft: str
    flights: List[Dict[str, Any]] = []
    hotels: List[Dict[str, Any]] = []
    weather: Dict[str, Any] = {}
    attractions: List[Dict[str, Any]] = []
    restaurants: List[Dict[str, Any]] = []
    route_details: Dict[str, Any] = {}
    budget_breakdown: Dict[str, Any] = {}
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
