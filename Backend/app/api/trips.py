from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.ai.orchestrator.langgraph_graph import graph
from app.database.mongodb import db
from app.models.trip import TripModel
from datetime import datetime

router = APIRouter()

# Input validation schemas for API requests
class PlanRequest(BaseModel):
    user_message: Optional[str] = None # Used for Chat UI
    destination: Optional[str] = None  # Used for Form UI
    days: Optional[int] = None         # Used for Form UI
    budget: Optional[float] = None     # Used for Form UI
    preferences: Optional[str] = None  # Extra preferences

@router.post("/plan")
def plan_trip(request: PlanRequest):
    print("--- API: Received trip planning request ---")
    
    # 1. Prepare initial state for LangGraph
    initial_state = {
        "user_message": request.user_message,
        "destination": request.destination,
        "days": request.days,
        "budget": request.budget,
        "preferences": request.preferences,
        "completed_steps": [],
        "is_approved": False,
        "error_logs": []
    }
    
    # 2. Run the LangGraph agent pipeline
    try:
        final_state = graph.invoke(initial_state)
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Agent graph execution failed: {str(e)}"
        )
        
    # 3. Create a clean dictionary to save to MongoDB
    trip_data = {
        "user_message": final_state.get("user_message"),
        "destination": final_state.get("destination") or "Unknown",
        "days": int(final_state.get("days", 3)),
        "budget": float(final_state.get("budget", 500.0)),
        "preferences": final_state.get("preferences"),
        "planner_draft": final_state.get("planner_draft") or "No plan generated",
        "flights": final_state.get("flights") or [],
        "hotels": final_state.get("hotels") or [],
        "weather": final_state.get("weather") or {},
        "attractions": final_state.get("attractions") or [],
        "restaurants": final_state.get("restaurants") or [],
        "route_details": final_state.get("route_details") or {},
        "budget_breakdown": final_state.get("budget_breakdown") or {},
        "created_at": datetime.utcnow()
    }
    
    # 4. Save to MongoDB in the "trips" collection
    try:
        result = db.trips.insert_one(trip_data)
        # Add the string version of the MongoDB ID to our response
        trip_data["id"] = str(result.inserted_id)
        # Remove the BSON Object ID so JSON serialization works
        if "_id" in trip_data:
            del trip_data["_id"]
    except Exception as e:
        print(f"Warning: Failed to save trip to MongoDB: {e}")
        trip_data["id"] = "temporary_id" # Return data even if DB save fails
        
    return trip_data

@router.get("/history")
def get_trip_history():
    print("--- API: Fetching trip history ---")
    trips_list = []
    
    try:
        # Fetch latest 10 trips from MongoDB
        cursor = db.trips.find().sort("created_at", -1).limit(10)
        for doc in cursor:
            doc["id"] = str(doc["_id"])
            del doc["_id"]
            trips_list.append(doc)
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to fetch history: {str(e)}"
        )
        
    return trips_list
