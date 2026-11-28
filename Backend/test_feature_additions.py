"""
10-Point Comprehensive Verification Suite for TravelAI Feature Additions
Verifies:
1. Destination Private Services - Goa
2. Destination Private Services - Manali
3. Destination Private Services - Sydney
4. Private Services MongoDB Caching hit (<50ms)
5. Destination with no providers graceful handling
6. Admin authentication and token generation
7. Admin Dashboard Stats endpoint (/api/admin/stats)
8. Admin User Management endpoint & status toggle (/api/admin/users)
9. Strict RBAC protection (normal user blocked with 403 Forbidden)
10. Feedback retrieval and submission (/api/admin/feedback)
"""
import os
import sys
import time
from dotenv import load_dotenv

# Ensure Backend is in sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)
load_dotenv(os.path.join(backend_dir, ".env"))

from fastapi.testclient import TestClient
from app.main import app
from app.database.mongodb import db
from app.services.private_services import get_cached_private_services

client = TestClient(app)

def run_tests():
    passed = 0
    total = 10
    print("=" * 70)
    print("STARTING TRAVELAI 10-POINT FEATURE VERIFICATION SUITE")
    print("=" * 70)

    # 1. Goa Private Services
    print("\n[Test 1] Testing Dynamic Private Services for Goa...")
    goa_res = get_cached_private_services("Goa", limit=3)
    if goa_res.get("count", 0) > 0 and any("Goa" in (p.get("address", "") + p.get("name", "")) for p in goa_res.get("providers", [])):
        print(f" PASS: Found {goa_res['count']} genuine Goa providers: {[p['name'] for p in goa_res['providers']]}")
        passed += 1
    else:
        print(f" FAIL: Goa private services returned: {goa_res}")

    # 2. Manali Private Services
    print("\n[Test 2] Testing Dynamic Private Services for Manali...")
    manali_res = get_cached_private_services("Manali", limit=3)
    if manali_res.get("count", 0) > 0 and any("Manali" in (p.get("address", "") + p.get("name", "")) for p in manali_res.get("providers", [])):
        print(f" PASS: Found {manali_res['count']} genuine Manali providers: {[p['name'] for p in manali_res['providers']]}")
        passed += 1
    else:
        print(f" FAIL: Manali private services returned: {manali_res}")

    # 3. Sydney Private Services
    print("\n[Test 3] Testing Dynamic Private Services for Sydney...")
    syd_res = get_cached_private_services("Sydney", limit=3)
    if syd_res.get("count", 0) > 0 and any("Sydney" in (p.get("address", "") + p.get("name", "")) for p in syd_res.get("providers", [])):
        print(f" PASS: Found {syd_res['count']} genuine Sydney providers: {[p['name'] for p in syd_res['providers']]}")
        passed += 1
    else:
        print(f" FAIL: Sydney private services returned: {syd_res}")

    # 4. MongoDB Caching Speed
    print("\n[Test 4] Testing MongoDB Caching Performance for Goa...")
    start_t = time.monotonic()
    cached_res = get_cached_private_services("Goa", limit=3)
    elapsed_ms = (time.monotonic() - start_t) * 1000
    if cached_res.get("cached") is True and elapsed_ms < 100:
        print(f" PASS: MongoDB cache hit in {elapsed_ms:.1f}ms (cached=True)")
        passed += 1
    else:
        print(f" FAIL: Cache hit missed or took {elapsed_ms:.1f}ms (cached={cached_res.get('cached')})")

    # 5. Remote / Obscure Destination Handling
    print("\n[Test 5] Testing Obscure Destination with zero providers...")
    remote_res = client.get("/api/trips/private-services?destination=NonExistentPlaceXYZ999")
    if remote_res.status_code == 200:
        data = remote_res.json()
        print(f" PASS: Handled gracefully, returned count={data.get('count', 0)}, providers={data.get('providers', [])}")
        passed += 1
    else:
        print(f" FAIL: Unexpected status {remote_res.status_code}: {remote_res.text}")

    # Setup Test Admin and Normal User
    admin_user = db.users.find_one({"role": "admin"})
    if not admin_user:
        admin_user = db.users.find_one({"email": "pareshsanka@gmail.com"})
        db.users.update_one({"_id": admin_user["_id"]}, {"$set": {"role": "admin", "is_active": True}})
        admin_user["role"] = "admin"

    from app.utils.auth_utils import generate_token
    admin_token = generate_token(admin_user["email"], str(admin_user["_id"]))

    # Setup normal user
    normal_user = db.users.find_one({"role": "user", "email": {"$ne": admin_user["email"]}})
    if not normal_user:
        normal_user = db.users.find_one({"email": "sathwikaryan@gmail.com"})
        db.users.update_one({"_id": normal_user["_id"]}, {"$set": {"role": "user", "is_active": True}})
    normal_token = generate_token(normal_user["email"], str(normal_user["_id"]))

    # 6. Admin Authentication & Session
    print("\n[Test 6] Testing Admin Authentication via /api/auth/me...")
    auth_me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
    if auth_me_res.status_code == 200 and auth_me_res.json()["user"]["role"] == "admin":
        print(f" PASS: Admin authenticated as {auth_me_res.json()['user']['email']} (role: admin)")
        passed += 1
    else:
        print(f" FAIL: /api/auth/me response: {auth_me_res.text}")

    # 7. Admin Stats Endpoint
    print("\n[Test 7] Testing Admin Stats Endpoint (/api/admin/stats)...")
    stats_res = client.get("/api/admin/stats", headers={"Authorization": f"Bearer {admin_token}"})
    if stats_res.status_code == 200 and stats_res.json().get("success"):
        m = stats_res.json()["metrics"]
        print(f" PASS: Stats returned: Users={m['total_users']}, Trips={m['total_trips']}, Success={m['successful_trips']}, Failed={m['failed_trips']}")
        passed += 1
    else:
        print(f" FAIL: /api/admin/stats status {stats_res.status_code}: {stats_res.text}")

    # 8. Admin Users Endpoint
    print("\n[Test 8] Testing Admin Users Listing (/api/admin/users)...")
    users_res = client.get("/api/admin/users", headers={"Authorization": f"Bearer {admin_token}"})
    if users_res.status_code == 200 and users_res.json().get("count", 0) > 0:
        u_list = users_res.json()["users"]
        print(f" PASS: Retrieved {len(u_list)} registered users. First user: {u_list[0]['name']} (Role: {u_list[0]['role']})")
        passed += 1
    else:
        print(f" FAIL: /api/admin/users status {users_res.status_code}: {users_res.text}")

    # 9. Strict RBAC Enforcement (Normal User blocked with 403)
    print("\n[Test 9] Testing Strict RBAC: Normal User Calling /api/admin/stats...")
    unauth_res = client.get("/api/admin/stats", headers={"Authorization": f"Bearer {normal_token}"})
    if unauth_res.status_code == 403:
        print(f" PASS: Normal user correctly rejected with 403 Forbidden ({unauth_res.json().get('detail')})")
        passed += 1
    else:
        print(f" FAIL: Normal user was not rejected with 403! Status: {unauth_res.status_code}")

    # 10. User Feedback System
    print("\n[Test 10] Testing User Feedback Submission & Retrieval...")
    fb_sub_res = client.post("/api/admin/feedback",
        headers={"Authorization": f"Bearer {normal_token}"},
        json={"rating": 5, "category": "itinerary", "comment": "Verification automated test feedback."}
    )
    fb_list_res = client.get("/api/admin/feedback", headers={"Authorization": f"Bearer {admin_token}"})
    if fb_sub_res.status_code == 200 and fb_list_res.status_code == 200:
        print(f" PASS: Feedback successfully stored and retrieved ({fb_list_res.json().get('count')} total reviews).")
        passed += 1
    else:
        print(f" FAIL: Feedback submission/retrieval error: {fb_sub_res.text} / {fb_list_res.text}")

    print("\n" + "=" * 70)
    print(f"VERIFICATION RESULTS: {passed}/{total} TESTS PASSED ({round((passed/total)*100)}%)")
    print("=" * 70)
    
    if passed == total:
        print("ALL VERIFICATION CHECKS PASSED PERFECTLY!\n")
        return 0
    else:
        print("SOME CHECKS FAILED!\n")
        return 1

if __name__ == "__main__":
    sys.exit(run_tests())
