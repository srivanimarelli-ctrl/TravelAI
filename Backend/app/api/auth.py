import os
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, Field, field_validator
from pymongo.errors import DuplicateKeyError
from datetime import datetime
from typing import Optional
from bson import ObjectId
from app.database.mongodb import db
from app.utils.auth_utils import hash_password, verify_password, generate_token, require_user_id

router = APIRouter()

class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=8, max_length=128)

    @field_validator('email')
    @classmethod
    def valid_email(cls, value):
        import re
        value = value.strip().lower()
        if not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', value):
            raise ValueError('A valid email address is required')
        return value

class LoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=1, max_length=128)

@router.post("/register")
def register(req: RegisterRequest):
    email_clean = req.email.lower().strip()
    name_clean = req.name.strip()
    
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")
    
    if not name_clean:
        raise HTTPException(status_code=400, detail="Name is required")

    # Check existing user in MongoDB
    existing_user = db.users.find_one({"email": email_clean})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email is already registered. Please login instead.")

    admin_emails = [e.strip().lower() for e in os.getenv("ADMIN_EMAILS", "pareshsanka@gmail.com,admin@travelai.com").split(",") if e.strip()]
    assigned_role = "admin" if email_clean in admin_emails else "user"

    # Hash password and store in MongoDB
    hashed_pwd = hash_password(req.password)
    user_doc = {
        "name": name_clean,
        "email": email_clean,
        "password": hashed_pwd,
        "role": assigned_role,
        "is_active": True,
        "created_at": datetime.utcnow()
    }
    
    try:
        res = db.users.insert_one(user_doc)
    except DuplicateKeyError:
        raise HTTPException(status_code=400, detail="Email is already registered. Please login instead.")
    user_id = str(res.inserted_id)
    token = generate_token(email_clean, user_id)

    print(f"--- AUTH: New user registered in MongoDB: {name_clean} ({email_clean}) [Role: {assigned_role}] [ID: {user_id}] ---")

    return {
        "success": True,
        "token": token,
        "user": {
            "id": user_id,
            "name": name_clean,
            "email": email_clean,
            "role": assigned_role,
            "is_active": True
        }
    }

@router.post("/login")
def login(req: LoginRequest):
    email_clean = req.email.lower().strip()
    
    # Find user in MongoDB
    user = db.users.find_one({"email": email_clean})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(user.get("password", ""), req.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Your account has been deactivated. Please contact an administrator.")

    admin_emails = [e.strip().lower() for e in os.getenv("ADMIN_EMAILS", "pareshsanka@gmail.com,admin@travelai.com").split(",") if e.strip()]
    user_role = user.get("role", "user")
    if email_clean in admin_emails and user_role != "admin":
        db.users.update_one({"_id": user["_id"]}, {"$set": {"role": "admin"}})
        user_role = "admin"

    user_id = str(user["_id"])
    token = generate_token(email_clean, user_id)

    print(f"--- AUTH: User logged in from MongoDB: {user.get('name')} ({email_clean}) [Role: {user_role}] ---")

    return {
        "success": True,
        "token": token,
        "user": {
            "id": user_id,
            "name": user.get("name", email_clean.split("@")[0]),
            "email": email_clean,
            "role": user_role,
            "is_active": True
        }
    }

@router.get("/me")
def get_current_user(user_id: str = Depends(require_user_id)):
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=401, detail="User account not found")
    admin_emails = [e.strip().lower() for e in os.getenv("ADMIN_EMAILS", "pareshsanka@gmail.com,admin@travelai.com").split(",") if e.strip()]
    user_email = user.get("email", "").lower().strip()
    user_role = user.get("role", "user")
    if user_email in admin_emails and user_role != "admin":
        db.users.update_one({"_id": user["_id"]}, {"$set": {"role": "admin"}})
        user_role = "admin"
    return {
        "user": {
            "id": user_id,
            "name": user["name"],
            "email": user["email"],
            "role": user_role,
            "is_active": user.get("is_active", True)
        }
    }


@router.post("/logout")
def logout(user_id: str = Depends(require_user_id), authorization: str = Header(...)):
    import hashlib
    db.sessions.delete_one({"token_hash": hashlib.sha256(authorization[7:].strip().encode()).hexdigest()})
    return {"success": True}
