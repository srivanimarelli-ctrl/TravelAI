import sys
import os

# Ensure the parent directory is in the system path so we can import from app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.ai.orchestrator.langgraph_graph import graph
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def run_test():
    print("==================================================")
    print("STARTING TRAVELAI AGENT PIPELINE VERIFICATION TEST")
    print("==================================================")
    
    # We will test the Chat-Based path (sending a raw query string)
    test_input = {
        "user_message": "plan a 3-day budget trip to Jaipur under $500 with historical sightseeing preference.",
        "destination": None,
        "days": None,
        "budget": None,
        "preferences": None,
        "completed_steps": [],
        "is_approved": False
    }
    
    print(f"Test Input Query: '{test_input['user_message']}'\n")
    print("Running agents (this might take a few moments as it queries your local Qwen model)...")
    
    try:
        # Run the LangGraph workflow
        result = graph.invoke(test_input)
        
        print("\n==================================================")
        print("1. PARSER AGENT OUTPUTS:")
        print(f"   - Destination Extracted: {result.get('destination')}")
        print(f"   - Days Extracted: {result.get('days')}")
        print(f"   - Budget Extracted: {result.get('budget')}")
        print(f"   - Preferences Extracted: {result.get('preferences')}")
        
        print("\n--------------------------------------------------")
        print("2. PLANNER DRAFT OUTLINE:")
        print(result.get("planner_draft"))
        
        print("\n--------------------------------------------------")
        print("3. FLIGHTS AGENT OPTIONS:")
        print(result.get("flights"))
        
        print("\n--------------------------------------------------")
        print("4. HOTELS AGENT OPTIONS:")
        print(result.get("hotels"))
        
        print("\n--------------------------------------------------")
        print("5. WEATHER FORECAST:")
        print(result.get("weather"))
        
        print("\n--------------------------------------------------")
        print("6. BUDGET BREAKDOWN AUDIT:")
        print(result.get("budget_breakdown"))
        
        print("\n--------------------------------------------------")
        print("7. SEQUENCED DAILY ROUTES:")
        print(result.get("route_details"))
        
        print("\n--------------------------------------------------")
        print("8. REVIEWER AUDIT STATUS:")
        print(f"   - Is Approved? {result.get('is_approved')}")
        print(f"   - Feedback: {result.get('reviewer_feedback')}")
        
        print("\n--------------------------------------------------")
        print("9. STEPS LOG:")
        print(f"   - Completed Steps: {result.get('completed_steps')}")
        if result.get("error_logs"):
            print(f"   - Warnings/Errors: {result.get('error_logs')}")
            
        print("==================================================")
        print("VERIFICATION TEST COMPLETED SUCCESSFULLY!")
        print("==================================================")
        
    except Exception as e:
        print(f"\nTEST FAILED WITH ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    run_test()
