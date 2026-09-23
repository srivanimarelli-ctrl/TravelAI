import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq

# Ensure environment variables from .env are loaded first
load_dotenv()

# Initialize the shared Groq LLM instance
llm = ChatGroq(
    model="qwen/qwen3.8-27b",
    temperature=0.0,
    max_tokens=900
)

print(f"--- LLM MANAGER: Initialized with Groq (qwen/qwen3.8-27b) ---")
