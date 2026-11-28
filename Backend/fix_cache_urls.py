import sys
import os
import urllib.parse
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
sys.path.insert(0, os.path.dirname(__file__))

from app.database.mongodb import db

docs = list(db.private_services_cache.find({}))
updated_count = 0
for d in docs:
    providers = d.get('providers', [])
    changed = False
    for p in providers:
        m = p.get('maps_url')
        if not m or 'serpapi.com' in m:
            lat = p.get('latitude')
            lon = p.get('longitude')
            if lat is not None and lon is not None:
                p['maps_url'] = f"https://www.google.com/maps/search/?api=1&query={lat},{lon}"
            else:
                q = urllib.parse.quote(f"{p.get('name', '')} {p.get('address', '')}".strip())
                p['maps_url'] = f"https://www.google.com/maps/search/?api=1&query={q}"
            changed = True
    if changed:
        db.private_services_cache.update_one({'_id': d['_id']}, {'$set': {'providers': providers}})
        updated_count += 1

print(f"Successfully sanitized {updated_count} cache documents with direct Google Maps URLs.")
