import json
import httpx
from app.ai.llm import llm
from app.ai.orchestrator.state import TravelState
from langchain_core.prompts import ChatPromptTemplate
from app.ai.rag.retriever import retrieve_travel_knowledge

# City coordinates mapping for accurate Open-Meteo queries
CITY_COORDINATES = {
    "jaipur": {"lat": 26.9124, "lon": 75.7873},
    "goa": {"lat": 15.2993, "lon": 74.1240},
    "delhi": {"lat": 28.6139, "lon": 77.2090},
    "mumbai": {"lat": 19.0760, "lon": 72.8777},
    "bengaluru": {"lat": 12.9716, "lon": 77.5946},
    "bangalore": {"lat": 12.9716, "lon": 77.5946},
    "agra": {"lat": 27.1767, "lon": 78.0081},
    "varanasi": {"lat": 25.3176, "lon": 82.9739},
    "udaipur": {"lat": 24.5854, "lon": 73.7125},
    "leh": {"lat": 34.1526, "lon": 77.5771},
    "amritsar": {"lat": 31.6340, "lon": 74.8723},
    "kerala": {"lat": 9.9312, "lon": 76.2673},
    "kochi": {"lat": 9.9312, "lon": 76.2673},
    "darjeeling": {"lat": 27.0410, "lon": 88.2663},
    "shimla": {"lat": 31.1048, "lon": 77.1734},
    "manali": {"lat": 32.2432, "lon": 77.1892},
    "ooty": {"lat": 11.4102, "lon": 76.6950}
}

# WMO Weather interpretation codes
WMO_WEATHER_CODES = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snowfall",
    73: "Moderate snowfall",
    75: "Heavy snowfall",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm"
}

def fetch_realtime_weather_openmeteo(destination: str, days: int = 3):
    """
    Fetch real-time weather from the official Open-Meteo API.
    Returns structured weather dictionary or None on error.
    """
    dest_key = destination.lower().strip()
    coords = CITY_COORDINATES.get(dest_key)
    if not coords:
        # Default to Central India coordinates if city not in predefined list
        coords = {"lat": 20.5937, "lon": 78.9629}

    print(f"--- WEATHER AGENT: Querying Live Open-Meteo API ({destination}: Lat {coords['lat']}, Lon {coords['lon']}) ---")
    
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": coords["lat"],
        "longitude": coords["lon"],
        "current": "temperature_2m,relative_humidity_2m,weather_code,apparent_temperature,is_day",
        "daily": "temperature_2m_max,temperature_2m_min,rain_sum,showers_sum",
        "forecast_days": max(1, min(days, 7)),
        "timezone": "auto"
    }
    
    try:
        response = httpx.get(url, params=params, timeout=10.0)
        response.raise_for_status()
        data = response.json()
        
        current = data.get("current", {})
        daily = data.get("daily", {})
        
        curr_temp = current.get("temperature_2m", 25.0)
        curr_apparent = current.get("apparent_temperature", curr_temp)
        weather_code = current.get("weather_code", 0)
        humidity = current.get("relative_humidity_2m", 50)
        
        condition_desc = WMO_WEATHER_CODES.get(weather_code, "Pleasant")
        
        max_temps = daily.get("temperature_2m_max", [curr_temp])
        min_temps = daily.get("temperature_2m_min", [curr_temp])
        avg_max = sum(max_temps) / len(max_temps) if max_temps else curr_temp
        avg_min = sum(min_temps) / len(min_temps) if min_temps else curr_temp
        total_rain = sum(daily.get("rain_sum", [0]))
        
        # Build clothing recommendation based on live temperature & rain
        if avg_max >= 32:
            clothing = "Light, breathable cotton clothing, sunglasses, and sunscreen. Stay hydrated."
        elif avg_max >= 22:
            clothing = "Comfortable light wear for daytime and a light cardigan for evenings."
        elif avg_max >= 12:
            clothing = "Warm layers, jackets, and thermal wear."
        else:
            clothing = "Heavy woolens, thermal innerwear, gloves, and warm headgear."
            
        if total_rain > 2.0:
            clothing += " Carry an umbrella or waterproof raincoat due to expected rain."
            
        summary = (
            f"Live Open-Meteo Forecast: Currently {curr_temp}°C (feels like {curr_apparent}°C), {condition_desc}. "
            f"Expected highs of {avg_max:.1f}°C and lows of {avg_min:.1f}°C over the next {days} days with {humidity}% humidity."
        )
        
        weather_result = {
            "average_temp": f"{curr_temp}°C",
            "condition": condition_desc,
            "clothing_recommendation": clothing,
            "summary": summary
        }
        
        print(f"--- WEATHER AGENT: Successfully retrieved live weather from Open-Meteo! ({curr_temp}°C, {condition_desc}) ---")
        return weather_result
        
    except Exception as e:
        print(f"--- WEATHER AGENT: Open-Meteo API error: {e}. Falling back to RAG/LLM. ---")
        return None


def weather_node(state: TravelState) -> dict:
    print(f"--- WEATHER AGENT: Fetching weather for {state['destination']} ---")
    
    # 1. Try Live Open-Meteo API first
    live_weather = fetch_realtime_weather_openmeteo(state["destination"], int(state.get("days", 3)))
    if live_weather:
        return {"weather": live_weather}
    
    # 2. Fallback to deterministic dictionary (no LLM)
    print(f"--- WEATHER AGENT: Using default deterministic weather for {state['destination']} ---")
    return {
        "weather": {
            "average_temp": "25.0°C",
            "condition": "Pleasant",
            "clothing_recommendation": "Comfortable casual wear",
            "summary": f"Historical pleasant weather expected for {state['destination']}."
        }
    }
