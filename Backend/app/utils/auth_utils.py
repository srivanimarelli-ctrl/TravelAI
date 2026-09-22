import hashlib
import os
import secrets
from datetime import datetime, timedelta

SECRET_KEY = os.getenv("JWT_SECRET", "travelai_super_secret_jwt_key_2026")

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
    """Generate a secure access token."""
    random_str = secrets.token_hex(16)
    timestamp = datetime.utcnow().isoformat()
    raw = f"{user_id}:{email}:{timestamp}:{random_str}"
    return hashlib.sha256(f"{raw}:{SECRET_KEY}".encode('utf-8')).hexdigest()
