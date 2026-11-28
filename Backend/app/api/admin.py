"""
Admin Dashboard Router for TravelAI
Protected at the backend level with Role-Based Access Control (RBAC).
Provides genuine real-time database aggregations, user management, and agent execution logs.
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
import time
import os

from app.database.mongodb import db, client
from app.utils.auth_utils import require_admin, require_user_id
from app.services.discovery_status import account_status as get_serpapi_status

router = APIRouter()

class UserStatusUpdateRequest(BaseModel):
    is_active: bool

class FeedbackSubmissionRequest(BaseModel):
    trip_id: Optional[str] = None
    rating: int = Field(ge=1, le=5)
    category: Optional[str] = "general"
    comment: str = Field(min_length=1, max_length=1000)

@router.get("/stats")
def get_admin_stats(admin: dict = Depends(require_admin)):
    """Aggregates real system statistics directly from MongoDB database records."""
    try:
        # Total counts
        total_users = db.users.count_documents({})
        total_trips = db.trips.count_documents({})
        total_conversations = db.conversations.count_documents({})
        
        # Trip generation success & failure counts from genuine planning requests
        successful_trips = db.planning_requests.count_documents({"status": "succeeded"})
        failed_trips = db.planning_requests.count_documents({"status": "failed"})
        in_progress_trips = db.planning_requests.count_documents({"status": "in_progress"})
        
        # In case some trips exist in db.trips before planning_requests tracking
        if successful_trips == 0 and total_trips > 0:
            successful_trips = total_trips

        # Aggregate top popular destinations from real trip records
        dest_pipeline = [
            {"$match": {"destination": {"$ne": None, "$type": "string"}}},
            {"$group": {"_id": "$destination", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 8}
        ]
        dest_agg = list(db.trips.aggregate(dest_pipeline))
        popular_destinations = [
            {"destination": item["_id"], "count": item["count"]}
            for item in dest_agg if item["_id"]
        ]

        # Live system health probe
        # 1. MongoDB ping
        mongo_start = time.monotonic()
        mongo_status = "healthy"
        try:
            client.admin.command("ping")
            mongo_latency_ms = round((time.monotonic() - mongo_start) * 1000, 2)
        except Exception:
            mongo_status = "degraded"
            mongo_latency_ms = 999.0

        # 2. SerpApi status
        serpapi_health = get_serpapi_status()
        
        # 3. Groq LLM model
        groq_model = os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b")

        return {
            "success": True,
            "metrics": {
                "total_users": total_users,
                "total_trips": total_trips,
                "successful_trips": successful_trips,
                "failed_trips": failed_trips,
                "in_progress_trips": in_progress_trips,
                "total_conversations": total_conversations,
            },
            "popular_destinations": popular_destinations,
            "system_health": {
                "mongodb": {
                    "status": mongo_status,
                    "latency_ms": mongo_latency_ms,
                    "database": os.getenv("MONGODB_DB_NAME", "travel_ai")
                },
                "groq_llm": {
                    "status": "healthy" if os.getenv("GROQ_API_KEY") else "missing_key",
                    "model": groq_model
                },
                "serpapi": {
                    "status": "healthy" if serpapi_health.get("authenticated") else ("offline" if serpapi_health.get("exhausted") else "ready"),
                    "plan": serpapi_health.get("plan_id", "Free Tier"),
                    "searches_per_month": serpapi_health.get("searches_per_month"),
                    "total_searches_left": serpapi_health.get("total_searches_left"),
                }
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to aggregate admin statistics: {str(e)}")


@router.get("/users")
def get_admin_users(admin: dict = Depends(require_admin)):
    """Lists registered users excluding passwords, with real trip generation counts."""
    users_cursor = db.users.find({}, {"password": 0}).sort("created_at", -1)
    users_list = []
    
    for u in users_cursor:
        user_id_str = str(u["_id"])
        trips_count = db.trips.count_documents({"user_id": user_id_str})
        created_at_dt = u.get("created_at")
        created_at_iso = created_at_dt.isoformat() if isinstance(created_at_dt, datetime) else str(created_at_dt or "")
        
        users_list.append({
            "id": user_id_str,
            "name": u.get("name", "Unknown"),
            "email": u.get("email", ""),
            "role": u.get("role", "user"),
            "is_active": u.get("is_active", True),
            "created_at": created_at_iso,
            "trips_count": trips_count
        })
        
    return {
        "success": True,
        "count": len(users_list),
        "users": users_list
    }


@router.patch("/users/{user_id}/status")
def update_user_status(user_id: str, req: UserStatusUpdateRequest, admin: dict = Depends(require_admin)):
    """Activates or deactivates a user account. Deactivation immediately invalidates sessions."""
    if admin["id"] == user_id:
        raise HTTPException(status_code=400, detail="Administrators cannot deactivate their own account.")
        
    try:
        obj_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format.")

    target_user = db.users.find_one({"_id": obj_id})
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found.")

    db.users.update_one({"_id": obj_id}, {"$set": {"is_active": req.is_active}})

    # If deactivating, revoke all active sessions for this user
    if not req.is_active:
        db.sessions.delete_many({"user_id": user_id})

    status_label = "activated" if req.is_active else "deactivated"
    print(f"--- ADMIN: User {target_user.get('email')} {status_label} by Admin {admin['email']} ---")

    return {
        "success": True,
        "message": f"User account successfully {status_label}.",
        "user_id": user_id,
        "is_active": req.is_active
    }


@router.get("/activity")
def get_recent_activity(admin: dict = Depends(require_admin)):
    """Retrieves recent trip generation activity and pipeline records."""
    requests_cursor = db.planning_requests.find({}).sort("created_at", -1).limit(20)
    activity_items = []
    
    for r in requests_cursor:
        u_id = r.get("user_id")
        user = db.users.find_one({"_id": ObjectId(u_id)}) if u_id else None
        user_name = user.get("name", "Explorer") if user else "Traveler"
        user_email = user.get("email", "") if user else ""
        
        # Extract destination if available
        result_data = r.get("result", {})
        travel_ctx = result_data.get("travel_context") or result_data.get("travelContext") or {}
        destination = travel_ctx.get("destination") or r.get("destination") or "Curated Trip"
        
        created_at_val = r.get("created_at")
        created_at_iso = created_at_val.isoformat() if isinstance(created_at_val, datetime) else str(created_at_val or "")

        activity_items.append({
            "request_id": r.get("request_id") or str(r.get("_id")),
            "trip_id": r.get("trip_id"),
            "destination": destination,
            "status": r.get("status", "unknown"),
            "user_name": user_name,
            "user_email": user_email,
            "message": r.get("message", ""),
            "created_at": created_at_iso,
        })

    return {
        "success": True,
        "count": len(activity_items),
        "activity": activity_items
    }


@router.get("/logs")
def get_agent_execution_logs(admin: dict = Depends(require_admin)):
    """Monitors live agent execution logs and stage completion records."""
    pipeline_records = db.planning_requests.find({}).sort("updated_at", -1).limit(15)
    logs = []

    for item in pipeline_records:
        stages = item.get("stages", {})
        dest = None
        res_data = item.get("result", {})
        if res_data and isinstance(res_data, dict):
            ctx = res_data.get("travel_context") or res_data.get("travelContext") or {}
            dest = ctx.get("destination")
        
        updated_at_val = item.get("updated_at") or item.get("created_at")
        updated_at_iso = updated_at_val.isoformat() if isinstance(updated_at_val, datetime) else str(updated_at_val or "")

        logs.append({
            "request_id": item.get("request_id") or str(item.get("_id")),
            "trip_id": item.get("trip_id"),
            "destination": dest or "Trip Generation",
            "overall_status": item.get("status", "unknown"),
            "stages": stages,
            "updated_at": updated_at_iso,
        })

    return {
        "success": True,
        "count": len(logs),
        "logs": logs
    }


@router.get("/feedback")
def get_user_feedback(admin: dict = Depends(require_admin)):
    """Retrieves real user ratings and feedback from MongoDB."""
    feedback_cursor = db.feedback.find({}).sort("created_at", -1).limit(50)
    feedback_items = []
    
    for f in feedback_cursor:
        u_id = f.get("user_id")
        user = db.users.find_one({"_id": ObjectId(u_id)}) if u_id else None
        
        created_at_val = f.get("created_at")
        created_at_iso = created_at_val.isoformat() if isinstance(created_at_val, datetime) else str(created_at_val or "")

        feedback_items.append({
            "id": str(f["_id"]),
            "user_name": user.get("name", "Traveler") if user else "Anonymous",
            "user_email": user.get("email", "") if user else "",
            "rating": f.get("rating", 5),
            "category": f.get("category", "general"),
            "comment": f.get("comment", ""),
            "trip_id": f.get("trip_id"),
            "created_at": created_at_iso
        })

    return {
        "success": True,
        "count": len(feedback_items),
        "feedback": feedback_items
    }


@router.post("/feedback")
def submit_feedback(req: FeedbackSubmissionRequest, user_id: str = Depends(require_user_id)):
    """Allows authenticated travelers to submit authentic ratings and feedback."""
    feedback_doc = {
        "user_id": user_id,
        "trip_id": req.trip_id,
        "rating": req.rating,
        "category": req.category,
        "comment": req.comment.strip(),
        "created_at": datetime.utcnow()
    }
    res = db.feedback.insert_one(feedback_doc)
    return {
        "success": True,
        "message": "Feedback submitted successfully.",
        "id": str(res.inserted_id)
    }
