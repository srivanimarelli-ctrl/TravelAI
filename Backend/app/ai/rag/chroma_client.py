import os
from langchain_community.vectorstores import Chroma
from app.ai.rag.embedder import embeddings

# Define the local database directory path
DB_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), 
    "chromadb_storage"
)

# Initialize LangChain's Chroma wrapper
# This automatically handles directory creation, collections, and vector search
vector_store = Chroma(
    collection_name="travel_knowledge",
    embedding_function=embeddings,
    persist_directory=DB_PATH
)
