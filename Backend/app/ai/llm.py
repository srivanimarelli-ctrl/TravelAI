import os
from dotenv import load_dotenv
from langchain_ollama import ChatOllama

# Ensure environment variables from .env are loaded first
load_dotenv()

# Retrieve configuration from .env file
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:3b")

print(f"--- LLM MANAGER: Initialized with model '{OLLAMA_MODEL}' at {OLLAMA_BASE_URL} ---")

# Initialize the shared Qwen LLM instance
llm = ChatOllama(
    base_url=OLLAMA_BASE_URL,
    model=OLLAMA_MODEL,
    temperature=0.0,
)
