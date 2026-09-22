from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from app.api.trips import router as trips_router
from app.api.chat import router as chat_router
from app.api.auth import router as auth_router

# Load environment variables from .env
load_dotenv()

travel_ai = FastAPI(title="TravelAI API")

# Next.js default port is 3000, Vite default port is 5173
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

travel_ai.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
travel_ai.include_router(trips_router, prefix="/api/trips")
travel_ai.include_router(chat_router)
travel_ai.include_router(auth_router, prefix="/api/auth")

@travel_ai.get("/")
def read_root():
    return {
        "status": "online",
        "message": "TravelAI Backend is running successfully!"
    }
