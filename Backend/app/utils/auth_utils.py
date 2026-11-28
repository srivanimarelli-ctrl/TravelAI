import hashlib
import os
import secrets
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Header, HTTPException
from bson import ObjectId
from app.database.mongodb import db

# Sessions are opaque random tokens; no shared signing secret is required.

def hash_password(password: str) -> str:
    """Hash password using PBKDF2-HMAC-SHA256 with a unique random salt."""
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return f"{salt.hex()}${key.hex()}"

def verify_password(stored_hash: str, password: str) -> bool:
    """Verify password against stored hash."""
    try:
        if '$' not in stored_hash:
            return False
        # Handle legacy or format variants
        parts = stored_hash.split('$')
        if len(parts) != 2:
            return False
        salt_hex = parts[0].rstrip(':')
        key_hex = parts[1]
        salt = bytes.fromhex(salt_hex)
        key = bytes.fromhex(key_hex)
        new_key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
        return secrets.compare_digest(key, new_key)
    except Exception as e:
        print(f"Verify password error: {e}")
        return False

def generate_token(email: str, user_id: str) -> str:
    """Issue an opaque session; store only its digest on the server."""
    token = secrets.token_urlsafe(32)
    db.sessions.insert_one({
        "token_hash": hashlib.sha256(token.encode()).hexdigest(),
        "user_id": user_id,
        "expires_at": datetime.utcnow() + timedelta(hours=24),
    })
    return token


def require_user_id(authorization: Optional[str] = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")
    token = authorization[7:].strip()
    session = db.sessions.find_one({
        "token_hash": hashlib.sha256(token.encode()).hexdigest(),
        "expires_at": {"$gt": datetime.utcnow()},
    }) if token else None
    try:
        valid_user = session and db.users.find_one({"_id": ObjectId(session["user_id"])})
    except (KeyError, ValueError, TypeError):
        valid_user = None
    if not valid_user or not valid_user.get("is_active", True):
        raise HTTPException(status_code=401, detail="Session expired, invalid, or account deactivated.")
    return session["user_id"]


def require_admin(authorization: Optional[str] = Header(None)) -> dict:
    user_id = require_user_id(authorization)
    try:
        user = db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        user = None
    if not user:
        raise HTTPException(status_code=401, detail="User account not found.")

    admin_emails = [e.strip().lower() for e in os.getenv("ADMIN_EMAILS", "pareshsanka@gmail.com,admin@travelai.com").split(",") if e.strip()]
    user_email = user.get("email", "").lower().strip()

    is_admin = user.get("role") == "admin" or user_email in admin_emails
    if not is_admin:
        raise HTTPException(status_code=403, detail="Access denied. Admin privileges required.")

    if user.get("role") != "admin":
        db.users.update_one({"_id": user["_id"]}, {"$set": {"role": "admin"}})
        user["role"] = "admin"

    return {
        "id": str(user["_id"]),
        "name": user.get("name", "Admin"),
        "email": user_email,
        "role": "admin"
    }
