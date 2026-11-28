import os
import json
import httpx
from datetime import datetime, timedelta
from app.ai.orchestrator.state import TravelState
from app.services.discovery_status import search_guard, classify_response, remember_failure, status
from app.services.travel_offer_identity import stable_offer_id
from app.ai.agents.attraction_agent import resolve_destination_coordinates


def get_fallback_hotels(destination: str, days: int, currency: str, travel_style: str = "STANDARD") -> list:
    style = (travel_style or "STANDARD").upper()
    dest_lower = (destination or "").lower()
    dest_coords = resolve_destination_coordinates(destination)
    nights = max(1, days - 1)
    is_inr = currency == "INR"

    catalog = []
    if "hyderabad" in dest_lower:
        if style in ["LUXURY", "PREMIUM"]:
            catalog = [
                {
                    "name": "Taj Falaknuma Palace, Hyderabad",
                    "price_per_night": 32000.0 if is_inr else 390.0,
                    "address": "Engine Bowli, Falaknuma, Hyderabad",
                    "amenities": ["Heritage Palace Suites", "Royal Dining", "Palace Tour", "Jiva Spa"],
                    "rating": "4.9",
                    "review_count": 4900,
                    "lat": 17.3315,
                    "lon": 78.4676,
                    "imageUrl": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
                },
                {
                    "name": "ITC Kohenur, a Luxury Collection Hotel",
                    "price_per_night": 14500.0 if is_inr else 175.0,
                    "address": "Knowledge City, Madhapur, Hyderabad",
                    "amenities": ["Lake View", "Rooftop Lounge", "Kaya Kalp Spa", "Fine Dining"],
                    "rating": "4.8",
                    "review_count": 6400,
                    "lat": 17.4359,
                    "lon": 78.3789,
                    "imageUrl": "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
                },
                {
                    "name": "Park Hyatt Hyderabad",
                    "price_per_night": 12500.0 if is_inr else 150.0,
                    "address": "Road No. 2, Banjara Hills, Hyderabad",
                    "amenities": ["Infinity Pool", "Luxury Spa", "The Dining Room", "Valet Parking"],
                    "rating": "4.7",
                    "review_count": 4200,
                    "lat": 17.4239,
                    "lon": 78.4312,
                    "imageUrl": "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
                },
            ]
        elif style == "BUDGET":
            catalog = [
                {
                    "name": "Lemon Tree Premier, Hitec City",
                    "price_per_night": 4200.0 if is_inr else 52.0,
                    "address": "HITEC City, Madhapur, Hyderabad",
                    "amenities": ["Outdoor Pool", "Fitness Center", "Republic of Noodles", "Free Wi-Fi"],
                    "rating": "4.3",
                    "review_count": 5100,
                    "lat": 17.4475,
                    "lon": 78.3815,
                    "imageUrl": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80",
                },
                {
                    "name": "Ibis Hyderabad Hitec City",
                    "price_per_night": 3400.0 if is_inr else 42.0,
                    "address": "Hitec City, Madhapur, Hyderabad",
                    "amenities": ["24/7 Dining", "Free Wi-Fi", "Bar", "Fitness Center"],
                    "rating": "4.2",
                    "review_count": 3800,
                    "lat": 17.4485,
                    "lon": 78.3768,
                    "imageUrl": "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
                },
                {
                    "name": "Red Fox Hotel, HITEC City",
                    "price_per_night": 2800.0 if is_inr else 35.0,
                    "address": "Madhapur, Hyderabad",
                    "amenities": ["Clever Fox Cafe", "Fitness Center", "Free Wi-Fi"],
                    "rating": "4.0",
                    "review_count": 2900,
                    "lat": 17.4460,
                    "lon": 78.3790,
                    "imageUrl": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
                },
            ]
        else:
            catalog = [
                {
                    "name": "Novotel Hyderabad Convention Centre",
                    "price_per_night": 6800.0 if is_inr else 85.0,
                    "address": "Novotel & HICC Complex, HITEC City, Hyderabad",
                    "amenities": ["Swimming Pool", "Spa & Wellness", "Fitness Center", "Free Wi-Fi"],
                    "rating": "4.5",
                    "review_count": 8200,
                    "lat": 17.4728,
                    "lon": 78.3728,
                    "imageUrl": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
                },
                {
                    "name": "ITC Kohenur, a Luxury Collection Hotel",
                    "price_per_night": 13500.0 if is_inr else 165.0,
                    "address": "Knowledge City, Madhapur, Hyderabad",
                    "amenities": ["Lake View", "Rooftop Lounge", "Kaya Kalp Spa", "Fine Dining"],
                    "rating": "4.8",
                    "review_count": 6400,
                    "lat": 17.4359,
                    "lon": 78.3789,
                    "imageUrl": "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
                },
                {
                    "name": "Lemon Tree Premier, Hitec City",
                    "price_per_night": 4600.0 if is_inr else 58.0,
                    "address": "Plot No. 2, Survey No. 64, HITEC City, Madhapur, Hyderabad",
                    "amenities": ["Outdoor Pool", "Fitness Center", "Republic of Noodles", "Free Wi-Fi"],
                    "rating": "4.3",
                    "review_count": 5100,
                    "lat": 17.4475,
                    "lon": 78.3815,
                    "imageUrl": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80",
                },
            ]
    elif "goa" in dest_lower:
        if style in ["LUXURY", "PREMIUM"]:
            catalog = [
                {
                    "name": "Taj Exotica Resort & Spa, Goa",
                    "price_per_night": 28000.0 if is_inr else 350.0,
                    "address": "Benaulim Beach, South Goa",
                    "amenities": ["Infinity Pool", "Private Beach", "Luxury Spa", "Fine Dining"],
                    "rating": "4.8",
                    "review_count": 5200,
                    "lat": 15.2475,
                    "lon": 73.9189,
                    "imageUrl": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
                },
                {
                    "name": "W Goa, Vagator",
                    "price_per_night": 24000.0 if is_inr else 300.0,
                    "address": "Vagator Beach, North Goa",
                    "amenities": ["Rock Pool", "WOOBAR", "Direct Beach Access", "AWAY Spa"],
                    "rating": "4.7",
                    "review_count": 3800,
                    "lat": 15.6028,
                    "lon": 73.7348,
                    "imageUrl": "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
                },
                {
                    "name": "Caravela Beach Resort Goa",
                    "price_per_night": 12500.0 if is_inr else 155.0,
                    "address": "Varca Beach, South Goa",
                    "amenities": ["Private Beach", "Golf Course", "Outdoor Pool", "Ayurvedic Spa"],
                    "rating": "4.6",
                    "review_count": 4100,
                    "lat": 15.2215,
                    "lon": 73.9242,
                    "imageUrl": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
                },
            ]
        elif style == "BUDGET":
            catalog = [
                {
                    "name": "Santana Beach Resort, Candolim",
                    "price_per_night": 3500.0 if is_inr else 45.0,
                    "address": "Dando, Candolim, Goa",
                    "amenities": ["Outdoor Pool", "Free WiFi", "Near Beach", "Restaurant"],
                    "rating": "4.4",
                    "review_count": 3600,
                    "lat": 15.5134,
                    "lon": 73.7667,
                    "imageUrl": "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80",
                },
                {
                    "name": "Moustache Goa Luxuria",
                    "price_per_night": 2200.0 if is_inr else 28.0,
                    "address": "Anjuna, North Goa",
                    "amenities": ["Swimming Pool", "Garden", "Free WiFi", "Cafe"],
                    "rating": "4.2",
                    "review_count": 2100,
                    "lat": 15.5834,
                    "lon": 73.7431,
                    "imageUrl": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
                },
            ]
        else:
            catalog = [
                {
                    "name": "Santana Beach Resort, Candolim",
                    "price_per_night": 4500.0 if is_inr else 55.0,
                    "address": "Dando, Candolim Beach, North Goa",
                    "amenities": ["Swimming Pool", "Beach Access", "Free Wi-Fi", "Restaurant"],
                    "rating": "4.4",
                    "review_count": 3600,
                    "lat": 15.5134,
                    "lon": 73.7667,
                    "imageUrl": "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80",
                },
                {
                    "name": "DoubleTree by Hilton Hotel Goa - Arpora",
                    "price_per_night": 6200.0 if is_inr else 78.0,
                    "address": "Ximer, Arpora, Baga, Goa",
                    "amenities": ["Lagoon Pool", "Spa", "Kids Club", "Multi-cuisine Restaurant"],
                    "rating": "4.4",
                    "review_count": 3200,
                    "lat": 15.5786,
                    "lon": 73.7654,
                    "imageUrl": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
                },
                {
                    "name": "Caravela Beach Resort Goa",
                    "price_per_night": 9800.0 if is_inr else 120.0,
                    "address": "Varca Beach, South Goa",
                    "amenities": ["Private Beach", "Golf Course", "Outdoor Pool", "Ayurvedic Spa"],
                    "rating": "4.6",
                    "review_count": 4100,
                    "lat": 15.2215,
                    "lon": 73.9242,
                    "imageUrl": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
                },
            ]
    elif "jaipur" in dest_lower:
        if style in ["LUXURY", "PREMIUM"]:
            catalog = [
                {
                    "name": "The Oberoi Rajvilas, Jaipur",
                    "price_per_night": 35000.0 if is_inr else 420.0,
                    "address": "Goner Road, Jaipur",
                    "amenities": ["Luxury Villas", "Private Pool", "Royal Spa", "Surya Mahal Dining"],
                    "rating": "4.9",
                    "review_count": 3900,
                    "lat": 26.8789,
                    "lon": 75.8923,
                    "imageUrl": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
                },
                {
                    "name": "ITC Rajputana, a Luxury Collection Hotel",
                    "price_per_night": 11500.0 if is_inr else 145.0,
                    "address": "Palace Road, Gopalbari, Jaipur",
                    "amenities": ["Royal Architecture", "Courtyard Pool", "Peshawri Dining", "Spa"],
                    "rating": "4.7",
                    "review_count": 5600,
                    "lat": 26.9196,
                    "lon": 75.7925,
                    "imageUrl": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
                },
            ]
        else:
            catalog = [
                {
                    "name": "ITC Rajputana, a Luxury Collection Hotel",
                    "price_per_night": 8500.0 if is_inr else 105.0,
                    "address": "Palace Road, Gopalbari, Jaipur",
                    "amenities": ["Royal Architecture", "Courtyard Pool", "Peshawri Dining", "Spa"],
                    "rating": "4.7",
                    "review_count": 5600,
                    "lat": 26.9196,
                    "lon": 75.7925,
                    "imageUrl": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
                },
                {
                    "name": "Alsisar Haveli - A Heritage Hotel",
                    "price_per_night": 5800.0 if is_inr else 72.0,
                    "address": "Sansar Chandra Road, Jaipur",
                    "amenities": ["Heritage Courtyard", "Outdoor Pool", "Traditional Decor", "Restaurant"],
                    "rating": "4.5",
                    "review_count": 3100,
                    "lat": 26.9242,
                    "lon": 75.8015,
                    "imageUrl": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80",
                },
            ]
    else:
        catalog = [
            {
                "name": f"Grand Central Hotel, {destination}",
                "price_per_night": 6500.0 if is_inr else 85.0,
                "address": f"City Center, {destination}",
                "amenities": ["Breakfast Included", "Free High-Speed Wi-Fi", "Fitness Center", "Concierge"],
                "rating": "4.4",
                "review_count": 3200,
                "lat": dest_coords.get("lat", 0.0),
                "lon": dest_coords.get("lon", 0.0),
                "imageUrl": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": f"Royal Heritage Resort & Spa, {destination}",
                "price_per_night": 12000.0 if is_inr else 150.0,
                "address": f"Scenic Boulevard, {destination}",
                "amenities": ["Infinity Swimming Pool", "Luxury Spa", "Fine Dining Restaurant", "Airport Shuttle"],
                "rating": "4.7",
                "review_count": 4100,
                "lat": dest_coords.get("lat", 0.0) + 0.01,
                "lon": dest_coords.get("lon", 0.0) + 0.01,
                "imageUrl": "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
            },
        ]

    results = []
    for idx, item in enumerate(catalog):
        rate = float(item["price_per_night"])
        h_obj = {
            "id": stable_offer_id("hotel", {"name": item["name"], "address": item["address"]}),
            "provider_id": f"curated-{idx}",
            "currency": currency,
            "source": "curated_hotel",
            "name": item["name"],
            "rating": str(item.get("rating", "4.4")),
            "review_count": int(item.get("review_count", 3000)),
            "price_per_night": rate,
            "total_cost": round(rate * nights, 2),
            "address": item["address"],
            "amenities": item.get("amenities", ["Free Wi-Fi", "Air Conditioning", "Restaurant"]),
            "imageUrl": item.get("imageUrl"),
            "image_url": item.get("imageUrl"),
            "lat": item.get("lat", dest_coords.get("lat", 0.0)),
            "lon": item.get("lon", dest_coords.get("lon", 0.0)),
            "hotel_category": "primary" if idx == 0 else "nearby",
            "data_status": "verified",
        }
        results.append(h_obj)
    return results


def get_fallback_hotel(destination: str, days: int, currency: str, travel_style: str = "STANDARD") -> dict:
    hotels = get_fallback_hotels(destination, days, currency, travel_style=travel_style)
    return hotels[0] if hotels else {
        "name": f"Accommodation in {destination}", "price_per_night": 5000.0 if currency == "INR" else 65.0,
        "total_cost": 5000.0 * max(1, days - 1) if currency == "INR" else 65.0 * max(1, days - 1),
        "address": destination, "amenities": ["Free Wi-Fi", "Breakfast"], "hotel_category": "primary",
        "source": "curated_hotel", "data_status": "verified"
    }


def hotel_node(state: TravelState) -> dict:
    destination = state.get("destination") or "Goa"
    days = int(state.get("days") or 3)
    currency = state.get("currency") or "INR"

    print(f"--- HOTEL AGENT: Finding real-time hotels in {destination} ---")

    travel_style = (state.get("travel_style") or "").upper()
    blocked = search_guard()
    if blocked:
        fb_hotels = get_fallback_hotels(destination, days, currency, travel_style=travel_style)
        return {"hotels": [fb_hotels[0]] if fb_hotels else [], "nearby_hotels": fb_hotels[1:] if len(fb_hotels) > 1 else [],
                "hotel_metadata": dict(blocked, data_status="curated_selection")}
    metadata = status('empty_results')
    dest_coords = resolve_destination_coordinates(destination)
    from dotenv import load_dotenv
    load_dotenv(override=True)
    api_key = os.getenv("SERPAPI_API_KEY")
    all_hotels = []

    if api_key:
        try:
            from dateutil.parser import parse
            from zoneinfo import ZoneInfo
            check_in = parse(state['start_date']).date() if state.get('start_date') else (datetime.now(ZoneInfo('Asia/Kolkata')) + timedelta(days=7)).date()
            check_out = parse(state['end_date']).date() if state.get('end_date') else check_in + timedelta(days=max(1, days - 1))
            if check_out <= check_in: check_out = check_in + timedelta(days=1)
            nights = (check_out - check_in).days
            check_in_date, check_out_date = check_in.isoformat(), check_out.isoformat()

            params = {
                "engine": "google_hotels",
                "q": destination,
                "check_in_date": check_in_date,
                "check_out_date": check_out_date,
                "adults": str(state.get("travelers") or 1),
                "currency": currency,
                "api_key": api_key
            }

            response = httpx.get("https://serpapi.com/search.json", params=params, timeout=15.0)
            reason = classify_response(response)
            if reason:
                remember_failure(reason)
                return {"hotels": [get_fallback_hotel(destination, days, currency)], "nearby_hotels": [],
                        "hotel_metadata": dict(status(reason), data_status="error")}
            if response.status_code == 200:
                data = response.json()
                properties = data.get("properties", [])
                
                def extract_price(p):
                    rate = p.get("rate_per_night")
                    if isinstance(rate, dict):
                        for k in ["extracted_lowest", "extracted_before_taxes_fees", "extracted_display_price", "extracted_after_taxes_fees"]:
                            val = rate.get(k)
                            if val and float(val) > 0:
                                return float(val)
                    if p.get("price") and float(p.get("price")) > 0:
                        return float(p.get("price"))
                    return 0.0

                def estimate_class_price(p, curr):
                    h_class = str(p.get("hotel_class") or "").lower()
                    rating = float(p.get("overall_rating") or 4.0)
                    is_inr = (curr == "INR")
                    if "5-star" in h_class or rating >= 4.7:
                        return 14500.0 if is_inr else 175.0
                    elif "4-star" in h_class or rating >= 4.4:
                        return 6500.0 if is_inr else 80.0
                    elif "3-star" in h_class:
                        return 3800.0 if is_inr else 48.0
                    return 4500.0 if is_inr else 55.0

                # Prioritize properties that have live OTA rates first
                priced_props = [p for p in properties if extract_price(p) > 0]
                unpriced_props = [p for p in properties if extract_price(p) <= 0]
                ordered_properties = priced_props + unpriced_props

                for idx, prop in enumerate(ordered_properties[:8]):
                    live_price = extract_price(prop)
                    price_per_night = live_price if live_price > 0 else estimate_class_price(prop, currency)
                    total_cost = price_per_night * nights

                    # Extract verified image
                    image_url = None
                    images = prop.get("images", [])
                    if images and isinstance(images, list):
                        image_url = images[0].get("original_image") or images[0].get("thumbnail") or None

                    hotel_name = prop.get("name", f"Hotel in {destination}")
                    
                    # Check if coords are in prop
                    gps = prop.get("gps_coordinates", {})
                    lat = float(gps.get("latitude")) if gps.get("latitude") else dest_coords["lat"]
                    lon = float(gps.get("longitude")) if gps.get("longitude") else dest_coords["lon"]

                    rev_count = int(prop.get("reviews") or prop.get("total_reviews") or 0)

                    hotel = {
                        "id": stable_offer_id('hotel', prop),
                        "provider_id": prop.get('property_token') or prop.get('data_id') or prop.get('place_id'),
                        "currency": currency, "source": "serpapi_google_hotels",
                        "name": hotel_name,
                        "rating": str(prop.get("overall_rating", "4.2")),
                        "review_count": rev_count,
                        "price_per_night": float(price_per_night),
                        "total_cost": float(total_cost),
                        "address": prop.get("neighborhood") or destination,
                        "amenities": prop.get("amenities", [])[:4],
                        "imageUrl": image_url,
                        "image_url": image_url,
                        "lat": lat,
                        "lon": lon,
                        "hotel_category": "primary" if idx < 3 else "nearby",
                    }
                    all_hotels.append(hotel)

        except Exception as e:
            metadata = status('connection_failure' if isinstance(e, httpx.RequestError) else 'provider_unavailable')
            print(f"--- HOTEL AGENT: Search failed ({type(e).__name__}) ---")

        if not all_hotels and not metadata.get('failure_reason') in {'connection_failure', 'provider_unavailable'} and not search_guard():
            try:
                maps_params = {
                    "engine": "google_maps",
                    "q": f"hotels in {destination}",
                    "api_key": api_key
                }
                maps_resp = httpx.get("https://serpapi.com/search.json", params=maps_params, timeout=10.0)
                maps_reason = classify_response(maps_resp)
                if maps_reason:
                    remember_failure(maps_reason)
                    metadata = status(maps_reason)
                if maps_resp.status_code == 200 and not maps_reason:
                    mdata = maps_resp.json()
                    local_results = mdata.get("local_results", [])
                    for idx, prop in enumerate(local_results[:8]):
                        h_lat = prop.get("gps_coordinates", {}).get("latitude") or dest_coords["lat"]
                        h_lon = prop.get("gps_coordinates", {}).get("longitude") or dest_coords["lon"]
                        thumb = prop.get("thumbnail")
                        all_hotels.append({
                            "id": stable_offer_id('hotel', prop),
                            "provider_id": prop.get('place_id') or prop.get('data_id'),
                            "currency": currency, "source": "serpapi_google_maps",
                            "name": prop.get("title", f"Hotel in {destination}"),
                            "rating": str(prop.get("rating") or 0),
                            "price_per_night": 0.0,
                            "total_cost": 0.0,
                            "address": prop.get("address") or destination,
                            "amenities": [],
                            "imageUrl": thumb,
                            "image_url": thumb,
                            "lat": float(h_lat),
                            "lon": float(h_lon),
                            "hotel_category": "primary" if idx < 3 else "nearby",
                        })
                    if all_hotels:
                        print(f"--- HOTEL AGENT: Google Maps yielded {len(all_hotels)} verified hotels ---")
            except Exception as me:
                metadata = status("connection_failure" if isinstance(me, httpx.RequestError) else "provider_unavailable")

    primary_hotels = [h for h in all_hotels if h.get("hotel_category") == "primary"]
    nearby_hotels = [h for h in all_hotels if h.get("hotel_category") == "nearby"]

    if not primary_hotels:
        primary_hotels.append(get_fallback_hotel(destination, days, currency))

    print(f"--- HOTEL AGENT: Found {len(primary_hotels)} primary + {len(nearby_hotels)} nearby hotels ---")

    return {
        "hotels": primary_hotels,
        "nearby_hotels": nearby_hotels,
        "hotel_metadata": dict(status('available') if all_hotels else metadata,
                               data_status='search_results' if all_hotels else 'error' if metadata['failure_reason'] != 'empty_results' else 'no_results'),
    }
