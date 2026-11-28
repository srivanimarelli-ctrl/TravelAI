"""
Dynamic Private Travel Services Discovery Service
Retrieves destination-specific private tour guides, local travel agencies, cab operators,
and sightseeing services using SerpApi Google Maps engine.
Implements MongoDB caching (7-day TTL), deduplication, destination validation, and resilience.
"""
import os
from dotenv import load_dotenv
load_dotenv()
import httpx
import urllib.parse
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

from app.database.mongodb import db
from app.services.discovery_status import search_guard

SERPAPI_API_KEY = os.getenv("SERPAPI_API_KEY", "")

CATEGORY_KEYWORDS = [
    ("Private Tour Guide", ["guide", "tour guide", "private guide", "excursion", "walk"]),
    ("Private Cab Service", ["taxi", "cab", "chauffeur", "car rental", "driver", "transport"]),
    ("Sightseeing Tour Operator", ["sightseeing", "safari", "boat", "cruise", "adventure", "expedition"]),
    ("Local Travel Agency", ["travel agency", "tour operator", "travel agent", "holiday", "travels"])
]

def classify_service_category(place_type: str, title: str, query_type: str) -> str:
    combined = f"{place_type} {title} {query_type}".lower()
    for cat_name, keywords in CATEGORY_KEYWORDS:
        if any(kw in combined for kw in keywords):
            return cat_name
    return "Private Travel Service"

def is_destination_relevant(address: Optional[str], title: str, destination: str) -> bool:
    """Verifies that the discovered place has geographic relevance to the destination."""
    dest_clean = destination.strip().lower()
    # Break composite destinations like "Goa, India" or "North Goa"
    dest_tokens = [t.strip() for t in dest_clean.replace(",", " ").split() if len(t.strip()) > 2]
    
    combined_target = f"{address or ''} {title}".lower()
    # At least one major destination token should be present, or address has country/state match
    if any(tok in combined_target for tok in dest_tokens):
        return True
    
    # If no address is present, assume provider matched query if found in local results
    if not address:
        return True
        
    return False

def discover_destination_private_services(destination: str, limit: int = 12, timeout_seconds: float = 12.0) -> List[Dict[str, Any]]:
    """
    Executes targeted queries against SerpApi Google Maps engine for destination-specific private providers.
    Uses zero synthetic or fabricated data.
    """
    api_key = os.getenv("SERPAPI_API_KEY", SERPAPI_API_KEY).strip()
    if not api_key or search_guard():
        print(f"--- PRIVATE SERVICES: SerpApi unavailable or search_guard active. Skipping live search for '{destination}' ---")
        return []

    dest_clean = destination.strip()
    queries = [
        ("Private Tour Guide", f"Private tour guides in {dest_clean}"),
        ("Local Travel Agency", f"Local travel agencies in {dest_clean}"),
        ("Private Sightseeing Tour", f"Private sightseeing tours in {dest_clean}"),
        ("Private Cab Service", f"Private cab services in {dest_clean}")
    ]

    discovered: List[Dict[str, Any]] = []
    seen_ids = set()
    seen_titles = set()

    for category_hint, query_text in queries:
        if len(discovered) >= limit:
            break
        try:
            url = f"https://serpapi.com/search.json?engine=google_maps&q={urllib.parse.quote(query_text)}&api_key={api_key}"
            resp = httpx.get(url, timeout=timeout_seconds)
            if resp.status_code != 200:
                continue

            data = resp.json()
            local_results = data.get("local_results", [])

            for item in local_results:
                title = item.get("title")
                if not title:
                    continue

                title_norm = title.strip().lower()
                place_id = item.get("place_id") or item.get("data_id") or title_norm

                if place_id in seen_ids or title_norm in seen_titles:
                    continue

                address = item.get("address")
                # Geographic validation
                if not is_destination_relevant(address, title, dest_clean):
                    continue

                seen_ids.add(place_id)
                seen_titles.add(title_norm)

                gps = item.get("gps_coordinates") or {}
                lat = float(gps.get("latitude")) if gps.get("latitude") is not None else None
                lon = float(gps.get("longitude")) if gps.get("longitude") is not None else None

                place_type = item.get("type") or (item.get("types", [""])[0] if item.get("types") else "")
                category = classify_service_category(place_type, title, category_hint)

                # Direct Google Maps Web Link
                if lat is not None and lon is not None:
                    maps_url = f"https://www.google.com/maps/search/?api=1&query={lat},{lon}"
                else:
                    search_q = urllib.parse.quote(f"{title} {address or dest_clean}".strip())
                    maps_url = f"https://www.google.com/maps/search/?api=1&query={search_q}"

                image_url = item.get("thumbnail") or item.get("serpapi_thumbnail")

                provider_doc = {
                    "id": f"ps_{place_id[:24] if len(place_id) > 24 else place_id}",
                    "name": title.strip(),
                    "service_category": category,
                    "location": dest_clean,
                    "address": address or f"{dest_clean}, Local Service",
                    "rating": float(item.get("rating")) if item.get("rating") is not None else None,
                    "review_count": int(item.get("reviews")) if item.get("reviews") is not None else None,
                    "phone": item.get("phone"),
                    "website": item.get("website"),
                    "maps_url": maps_url,
                    "image_url": image_url,
                    "latitude": lat,
                    "longitude": lon,
                    "price": item.get("price"),
                    "operating_hours": item.get("hours") or item.get("open_state"),
                    "source": "serpapi_google_maps"
                }

                discovered.append(provider_doc)
                if len(discovered) >= limit:
                    break

        except Exception as e:
            print(f"--- PRIVATE SERVICES: SerpApi query error for '{query_text}': {type(e).__name__} ---")

    print(f"--- PRIVATE SERVICES: Discovered {len(discovered)} genuine providers for destination '{dest_clean}' ---")
    return discovered


def get_cached_private_services(destination: str, limit: int = 12) -> Dict[str, Any]:
    """
    Returns private travel services for a destination with MongoDB caching (7 days TTL).
    Guarantees zero interruption to trip planning.
    """
    dest_clean = destination.strip()
    if not dest_clean:
        return {"destination": "", "providers": [], "cached": False, "count": 0}

    dest_key = dest_clean.lower()
    now = datetime.utcnow()

    # 1. Check MongoDB cache
    try:
        cached = db.private_services_cache.find_one({"destination_key": dest_key})
        if cached and cached.get("expires_at", now) > now and len(cached.get("providers", [])) > 0:
            return {
                "destination": dest_clean,
                "providers": cached["providers"],
                "cached": True,
                "count": len(cached["providers"]),
                "fetched_at": cached.get("fetched_at", now).isoformat()
            }
    except Exception as cache_err:
        print(f"--- PRIVATE SERVICES: Cache lookup warning: {cache_err} ---")

    # 2. Live SerpApi Discovery
    providers = discover_destination_private_services(dest_clean, limit=limit)

    # 3. Store in MongoDB Cache if results found
    if providers:
        try:
            db.private_services_cache.update_one(
                {"destination_key": dest_key},
                {
                    "$set": {
                        "destination_key": dest_key,
                        "destination": dest_clean,
                        "providers": providers,
                        "fetched_at": now,
                        "expires_at": now + timedelta(days=7)
                    }
                },
                upsert=True
            )
        except Exception as save_err:
            print(f"--- PRIVATE SERVICES: Cache save warning: {save_err} ---")

    return {
        "destination": dest_clean,
        "providers": providers,
        "cached": False,
        "count": len(providers),
        "fetched_at": now.isoformat()
    }
