import os
import sys
import json

# Add Backend to python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.services.chat_service import process_chat_message
from app.services.conversation_service import list_conversations, get_conversation_messages, delete_conversation

def run_test_suite():
    print("==================================================")
    print("STARTING TRAVELAI CONVERSATIONAL BACKEND TEST SUITE")
    print("==================================================\n")

    conv_id = None

    # TURN 1: Destination
    print("[TEST TURN 1]: User says 'I want to visit Goa.'")
    res1 = process_chat_message(conv_id, "I want to visit Goa.")
    conv_id = res1["conversation_id"]
    print(f"Conversation ID: {conv_id}")
    print(f"Intent: {res1['intent']}")
    print(f"Travel Context: {json.dumps(res1['travel_context'], indent=2)}")
    print(f"Assistant Message: {res1['message']['content']}\n")
    assert res1["intent"] == "UPDATE_CONTEXT"
    assert res1["travel_context"]["destination"] == "Goa"

    # TURN 2: Duration
    print("[TEST TURN 2]: User says '4 days.'")
    res2 = process_chat_message(conv_id, "4 days.")
    print(f"Intent: {res2['intent']}")
    print(f"Travel Context: {json.dumps(res2['travel_context'], indent=2)}")
    print(f"Assistant Message: {res2['message']['content']}\n")
    assert res2["intent"] == "UPDATE_CONTEXT"
    assert res2["travel_context"]["days"] == 4

    # TURN 3: Luxury/Flexible Budget
    print("[TEST TURN 3]: User says 'Budget is your choice. Give me the rich one.'")
    res3 = process_chat_message(conv_id, "Budget is your choice. Give me the rich one.")
    print(f"Intent: {res3['intent']}")
    print(f"Travel Context: {json.dumps(res3['travel_context'], indent=2)}")
    print(f"Assistant Message: {res3['message']['content']}\n")
    assert res3["intent"] == "UPDATE_CONTEXT"
    assert res3["travel_context"]["travel_style"] == "LUXURY" or res3["travel_context"]["budget_mode"] in ["LUXURY", "FLEXIBLE", "NO_LIMIT"]

    # TURN 4: Transport and Accommodation Preferences
    print("[TEST TURN 4]: User says 'I want business class flights and a 5-star hotel.'")
    res4 = process_chat_message(conv_id, "I want business class flights and a 5-star hotel.")
    print(f"Intent: {res4['intent']}")
    print(f"Travel Context: {json.dumps(res4['travel_context'], indent=2)}")
    print(f"Assistant Message: {res4['message']['content']}\n")
    assert res4["intent"] == "UPDATE_CONTEXT"

    # TURN 5: Constraints
    print("[TEST TURN 5]: User says 'Avoid crowded places.'")
    res5 = process_chat_message(conv_id, "Avoid crowded places.")
    print(f"Intent: {res5['intent']}")
    print(f"Travel Context: {json.dumps(res5['travel_context'], indent=2)}")
    print(f"Assistant Message: {res5['message']['content']}\n")

    # TURN 6: TRAVEL_QA
    print("[TEST TURN 6 - QA]: User asks 'What is the weather like in Goa?'")
    res6 = process_chat_message(conv_id, "What is the weather like in Goa?")
    print(f"Intent: {res6['intent']}")
    print(f"Assistant Answer: {res6['message']['content']}\n")
    assert res6["intent"] == "TRAVEL_QA"

    # TURN 7: GENERATE_ITINERARY
    print("[TEST TURN 7 - GENERATE]: User says 'Create my itinerary.'")
    res7 = process_chat_message(conv_id, "Create my itinerary.")
    print(f"Intent: {res7['intent']}")
    print(f"Assistant Message: {res7['message']['content']}")
    print(f"Generated Trip ID: {res7['data']['trip_id'] if res7['data'] else 'None'}")
    assert res7["intent"] == "GENERATE_ITINERARY"
    assert res7["data"] is not None
    assert res7["data"]["type"] == "itinerary"
    print("Itinerary Generated Successfully!\n")

    # TURN 8: MODIFY_ITINERARY
    print("[TEST TURN 8 - MODIFY]: User says 'Change day 2 to focus on watersports.'")
    res8 = process_chat_message(conv_id, "Change day 2 to focus on watersports.")
    print(f"Intent: {res8['intent']}")
    print(f"Assistant Message: {res8['message']['content']}\n")
    assert res8["intent"] == "MODIFY_ITINERARY"

    # List conversations check
    convs = list_conversations()
    print(f"[TEST CONVERSATIONS LIST]: Found {len(convs)} conversations.")
    assert len(convs) > 0

    print("==================================================")
    print("ALL CONVERSATIONAL BACKEND TESTS PASSED SUCCESSFULLY!")
    print("==================================================")

if __name__ == "__main__":
    run_test_suite()
