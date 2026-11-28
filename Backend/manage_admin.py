"""
TravelAI Admin Account Management CLI
Usage:
  python manage_admin.py promote <email>
  python manage_admin.py demote <email>
  python manage_admin.py list
"""
import sys
import os
from dotenv import load_dotenv

load_dotenv()
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.mongodb import db

def list_users():
    users = list(db.users.find({}, {"name": 1, "email": 1, "role": 1, "is_active": 1, "created_at": 1}))
    print(f"\n--- Registered Users ({len(users)}) ---")
    for u in users:
        role = u.get("role", "user")
        status = "Active" if u.get("is_active", True) else "Inactive"
        print(f" • {u.get('name', 'N/A')} <{u.get('email')}> | Role: {role.upper()} | Status: {status} | ID: {u.get('_id')}")
    print()

def set_role(email: str, role: str):
    email_clean = email.strip().lower()
    res = db.users.update_one({"email": email_clean}, {"$set": {"role": role, "is_active": True}})
    if res.matched_count == 0:
        print(f"Error: User with email '{email_clean}' not found in MongoDB.")
        sys.exit(1)
    print(f"Success: Updated '{email_clean}' role to '{role}'.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python manage_admin.py [promote <email> | demote <email> | list]")
        sys.exit(0)
    
    cmd = sys.argv[1].lower()
    if cmd == "list":
        list_users()
    elif cmd in ("promote", "admin"):
        if len(sys.argv) < 3:
            print("Error: Specify email to promote. Example: python manage_admin.py promote user@example.com")
            sys.exit(1)
        set_role(sys.argv[2], "admin")
    elif cmd in ("demote", "user"):
        if len(sys.argv) < 3:
            print("Error: Specify email to demote. Example: python manage_admin.py demote user@example.com")
            sys.exit(1)
        set_role(sys.argv[2], "user")
    else:
        print(f"Unknown command: {cmd}. Available commands: list, promote, demote")
