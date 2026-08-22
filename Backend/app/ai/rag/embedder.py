import os
from langchain_ollama import OllamaEmbeddings

# Retrieve the Ollama URL from environment variables
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

# Initialize the Ollama Embeddings using the nomic-embed-text model
embeddings = OllamaEmbeddings(
    base_url=OLLAMA_BASE_URL,
    model="nomic-embed-text"
)
