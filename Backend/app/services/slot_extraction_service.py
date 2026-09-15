import json
import re
from typing import Dict, Any, List, Optional
from app.ai.llm import llm
from langchain_core.prompts import ChatPromptTemplate

ANALYZER_PROMPT = ChatPromptTemplate.from_messages([
    (
        "system",
        "You are an expert travel assistant conversational analyzer. "
        "Your task is to analyze the user's message in the context of an ongoing travel planning conversation "
        "and determine the user's intent, extract travel preference variables (slots), and identify Q&A needs.\n\n"
        "Input context:\n"
        "- Current Travel Context: {current_context}\n"
        "- Previous Assistant Message: {previous_assistant_message}\n"
        "- Has Generated Itinerary: {has_current_trip}\n\n"
        "Supported Intents:\n"
        "1. UPDATE_CONTEXT: User is providing or modifying trip details (destination, duration, budget, travel style, flight/hotel preferences, interests, constraints).\n"
        "   - Note: Words like 'business class', '5 star hotel', 'cheap trip', 'give me the rich one', 'money doesn't matter', 'budget is your choice' are UPDATE_CONTEXT.\n"
        "2. TRAVEL_QA: User is asking informational or Q&A questions about a destination (weather, food, places to visit, general tips).\n"
        "3. GENERATE_ITINERARY: User explicitly requests creating/planning the itinerary, OR replies 'Yes/Sure/Do it' when the previous assistant message asked if they should build/create the itinerary.\n"
        "4. MODIFY_ITINERARY: When Has Generated Itinerary is True and the user asks to change, edit, or adjust the existing trip or a day (e.g. 'Change day 2 to focus on watersports', 'Make day 2 more relaxed', 'Remove that restaurant'), intent MUST be MODIFY_ITINERARY.\n\n"
        "Q&A Categories (only for TRAVEL_QA):\n"
        "- 'WEATHER': Questions about climate, temperature, weather.\n"
        "- 'ATTRACTION': Questions about places to see, landmarks, activities.\n"
        "- 'RESTAURANT': Questions about food, dining, dishes, restaurants.\n"
        "- 'GENERAL': General travel Q&A or destination advice.\n\n"
        "Slot Extraction Rules:\n"
        "- destination: string (e.g. 'Goa')\n"
        "- days: integer (e.g. 4)\n"
        "- budget: float numeric amount if explicit (e.g. 20000.0 for ₹20,000, 100000.0 for ₹1 lakh, 500.0 for $500)\n"
        "- currency: string code (e.g. 'INR', 'USD')\n"
        "- budget_mode: string ('FIXED', 'FLEXIBLE', 'ECONOMY', 'PREMIUM', 'LUXURY', 'NO_LIMIT')\n"
        "  - 'My budget is ₹20,000' -> budget: 20000, currency: 'INR', budget_mode: 'FIXED'\n"
        "  - 'Budget is your choice' / 'I don't have a fixed budget' -> budget: null, budget_mode: 'FLEXIBLE'\n"
        "  - 'Money doesn't matter' -> budget: null, budget_mode: 'NO_LIMIT', travel_style: 'LUXURY'\n"
        "  - 'Keep it cheap' -> budget_mode: 'ECONOMY', travel_style: 'BUDGET'\n"
        "  - 'Give me the rich one' / 'Luxury trip' -> budget_mode: 'LUXURY', travel_style: 'LUXURY'\n"
        "- travel_style: string ('BUDGET', 'STANDARD', 'PREMIUM', 'LUXURY')\n"
        "- transport_preferences: list of strings (e.g. ['business_class'], ['economy_flight'], ['private_cab'])\n"
        "- accommodation_preferences: list of strings (e.g. ['5_star'], ['standard_hotel'], ['resort'], ['homestay'])\n"
        "- preferences: list of strings (e.g. ['beaches', 'local food'])\n"
        "- constraints: list of strings (e.g. ['avoid crowded places'])\n\n"
        "Return ONLY a raw JSON object with keys: intent, slots, qa_category, confidence, needs_clarification, clarification_prompt.\n"
        "Do not include markdown wrappers or extra text."
    ),
    ("human", "{user_message}")
])

def normalize_currency_and_numbers(text: str) -> Dict[str, Any]:
    """
    Python fallback parser to extract explicit currency patterns if LLM misses them.
    Handles INR (₹, lakh, k, rupees) and USD ($).
    """
    result = {}
    lower = text.lower()
    
    # 1 Lakh = 100,000
    lakh_match = re.search(r'([₹\d\.]+)\s*(?:lakh|lac)', lower)
    if lakh_match:
        val_str = lakh_match.group(1).replace('₹', '').strip()
        try:
            val = float(val_str) * 100000
            result["budget"] = val
            result["currency"] = "INR"
            result["budget_mode"] = "FIXED"
        except ValueError:
            pass
            
    # 20k / 20,000
    k_match = re.search(r'[₹]?\s*(\d+)\s*k\b', lower)
    if k_match and "budget" not in result:
        try:
            result["budget"] = float(k_match.group(1)) * 1000
            result["currency"] = "INR"
            result["budget_mode"] = "FIXED"
        except ValueError:
            pass

    # ₹20,000 or INR 20000
    inr_match = re.search(r'(?:₹|inr|rs\.?|rupees)\s*([\d,]+)', lower)
    if inr_match and "budget" not in result:
        try:
            val = float(inr_match.group(1).replace(',', ''))
            result["budget"] = val
            result["currency"] = "INR"
            result["budget_mode"] = "FIXED"
        except ValueError:
            pass

    # $500 or 500 USD
    usd_match = re.search(r'(?:\$|usd)\s*([\d,]+)|([\d,]+)\s*(?:usd|dollars)', lower)
    if usd_match and "budget" not in result:
        raw_val = usd_match.group(1) or usd_match.group(2)
        try:
            result["budget"] = float(raw_val.replace(',', ''))
            result["currency"] = "USD"
            result["budget_mode"] = "FIXED"
        except ValueError:
            pass

    return result

def merge_travel_context(existing_context: Dict[str, Any], extracted_slots: Dict[str, Any]) -> Dict[str, Any]:
    """
    Performs a non-destructive merge of newly extracted slots into existing TravelContext.
    Scalars are updated only if provided. List fields append unique items.
    """
    updated = dict(existing_context)
    
    # List fields that should be merged as lists
    list_fields = ["preferences", "constraints", "accommodation_preferences", "transport_preferences"]
    
    for key, value in extracted_slots.items():
        if value is None:
            continue
            
        if key in list_fields:
            existing_list = updated.get(key) or []
            if isinstance(value, list):
                for item in value:
                    if item and item not in existing_list:
                        existing_list.append(item)
            elif isinstance(value, str) and value not in existing_list:
                existing_list.append(value)
            updated[key] = existing_list
        else:
            # Overwrite scalar only if new value is non-empty/valid
            updated[key] = value
            
    return updated

def analyze_user_message(
    user_message: str,
    current_context: Dict[str, Any],
    previous_assistant_message: Optional[str] = None,
    has_current_trip: bool = False
) -> Dict[str, Any]:
    """
    Single Conversational Analysis Step using Qwen LLM.
    Returns structured analysis containing intent, extracted slots, qa_category, and clarification flags.
    """
    print(f"--- ANALYZER: Analyzing message: '{user_message}' ---")
    
    prompt_val = ANALYZER_PROMPT.format_messages(
        user_message=user_message,
        current_context=json.dumps(current_context),
        previous_assistant_message=previous_assistant_message or "None",
        has_current_trip=has_current_trip
    )
    
    try:
        response = llm.invoke(prompt_val)
        content = response.content.strip()
        if content.startswith("```"):
            content = "\n".join(content.split("\n")[1:])
        if content.endswith("```"):
            content = "\n".join(content.split("\n")[:-1])
        content = content.strip()
        
        analysis = json.loads(content)
    except Exception as e:
        print(f"Warning: Analyzer LLM parsing failed: {e}. Falling back to default heuristics.")
        analysis = {
            "intent": "UPDATE_CONTEXT",
            "slots": {},
            "qa_category": None,
            "confidence": 0.5,
            "needs_clarification": False
        }

    # Apply Python currency regex fallback if slots budget is missing but numeric pattern exists
    python_currency = normalize_currency_and_numbers(user_message)
    if python_currency and "slots" in analysis:
        for k, v in python_currency.items():
            if k not in analysis["slots"] or analysis["slots"][k] is None:
                analysis["slots"][k] = v

    # Deterministic override for itinerary modifications when trip exists
    if has_current_trip:
        mod_pattern = r'\b(?:day\s*\d+|change|modify|replace|remove|swap|adjust|update day|instead of)\b'
        if re.search(mod_pattern, user_message, re.IGNORECASE):
            analysis["intent"] = "MODIFY_ITINERARY"

    return analysis
