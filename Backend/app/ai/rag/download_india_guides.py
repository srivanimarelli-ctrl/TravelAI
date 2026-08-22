import os
import sys
import httpx

# Add the Backend root directory to the system path so we can resolve imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))

# Target Indian destinations to download travel wikis for
DESTINATIONS = [
    "Agra",
    "Jaipur",
    "Delhi",
    "Mumbai",
    "Bengaluru",
    "Kerala",
    "Varanasi",
    "Udaipur",
    "Leh",
    "Manali",
    "Shimla",
    "Amritsar",
    "Ooty",
    "Darjeeling",
    "Goa"
]

KNOWLEDGE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "knowledge")
WIKIVOYAGE_API_URL = "https://en.wikivoyage.org/w/api.php"

def download_guide(city: str):
    print(f"Fetching Wikivoyage article for: {city}...")
    
    # Wikimedia API requires a custom User-Agent to prevent 403 Forbidden errors
    headers = {
        "User-Agent": "TravelPlannerBot/1.0 (sriva@example.com; contact: dev@example.com)"
    }
    
    # Query parameters to fetch clean plain text content
    params = {
        "action": "query",
        "prop": "extracts",
        "explaintext": True,
        "format": "json",
        "titles": city,
        "redirects": 1
    }
    
    try:
        response = httpx.get(WIKIVOYAGE_API_URL, params=params, headers=headers, timeout=20.0)
        response.raise_for_status()
        data = response.json()
        
        pages = data.get("query", {}).get("pages", {})
        if not pages:
            print(f"Warning: No wiki pages found in response for {city}.")
            return
            
        page_id = list(pages.keys())[0]
        if page_id == "-1":
            print(f"Warning: City '{city}' was not found on Wikivoyage.")
            return
            
        extract_content = pages[page_id].get("extract", "")
        if not extract_content.strip():
            print(f"Warning: Article for {city} was empty.")
            return
            
        # Clean the name to create a safe file name
        safe_name = city.lower().replace(" ", "_")
        file_path = os.path.join(KNOWLEDGE_DIR, f"{safe_name}_guide.txt")
        
        # Save as a plain text file using UTF-8 encoding
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(extract_content)
        print(f"SUCCESS - Saved: {city} Guide -> {file_path} ({len(extract_content)} characters)")
        
    except Exception as e:
        print(f"ERROR - Failed to download guide for {city}. Details: {e}")

def main():
    if not os.path.exists(KNOWLEDGE_DIR):
        os.makedirs(KNOWLEDGE_DIR)
        print(f"Created knowledge folder at: {KNOWLEDGE_DIR}")
        
    print("==================================================")
    print("STARTING DOWNLOAD OF INDIA TRAVEL KNOWLEDGE ARTICLES")
    print("==================================================")
    
    for city in DESTINATIONS:
        download_guide(city)
        
    print("\n==================================================")
    print("DOWNLOAD PROGRESS COMPLETE!")
    print(f"All guides saved to: {KNOWLEDGE_DIR}")
    print("You can now run: .\\.venv\\Scripts\\python app/ai/rag/ingest.py")
    print("==================================================")

if __name__ == "__main__":
    main()
