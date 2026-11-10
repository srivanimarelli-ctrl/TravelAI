import sys
import os
import hashlib

# Add the Backend root directory to the system path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))

from dotenv import load_dotenv
load_dotenv()
from app.ai.rag.config import settings

# Set path to the knowledge folder
KNOWLEDGE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "knowledge")

def ingest_documents():
    if not settings().enabled:
        print('RAG is disabled. Set RAG_ENABLED=true and install requirements-rag.txt before ingesting guides.')
        return False
    try:
        from langchain_community.document_loaders import DirectoryLoader, TextLoader
        from langchain_text_splitters import RecursiveCharacterTextSplitter
        from app.ai.rag.chroma_client import get_vector_store
        vector_store = get_vector_store()
    except Exception as error:
        print(f'RAG initialization unavailable ({type(error).__name__}). Check optional dependencies and storage configuration.')
        return False
    # 1. Read source guides only; never create or seed knowledge implicitly.
    if not os.path.exists(KNOWLEDGE_DIR):
        print(f"--- RAG INGESTION: Knowledge folder not found: {KNOWLEDGE_DIR} ---")
        print("Please place your travel guide text files (.txt) inside this folder and run again.")
        return

    print("--- RAG INGESTION: Scanning knowledge directory... ---")
    
    # 2. Load all .txt files from the directory using UTF-8 encoding
    loader = DirectoryLoader(
        KNOWLEDGE_DIR, 
        glob="**/*.txt", 
        loader_cls=TextLoader, 
        loader_kwargs={"encoding": "utf-8"}
    )
    try:
        docs = loader.load()
    except Exception as e:
        print(f"Unable to load knowledge documents ({type(e).__name__})")
        return
    
    if not docs:
        print("No .txt files found in the knowledge directory. Ingestion skipped.")
        return
        
    print(f"Loaded {len(docs)} document files.")
    
    # 3. Split the text into manageable chunks
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = text_splitter.split_documents(docs)
    print(f"Split documents into {len(chunks)} text chunks.")
    
    # 4. Embed and add to ChromaDB in batches of 100
    print("Embedding and adding chunks to ChromaDB in batches of 100...")
    try:
        batch_size = 100
        total_chunks = len(chunks)
        for i in range(0, total_chunks, batch_size):
            batch = chunks[i:i + batch_size]
            batch_num = (i // batch_size) + 1
            total_batches = (total_chunks + batch_size - 1) // batch_size
            print(f"Processing batch {batch_num}/{total_batches} (Chunks {i} to {min(i + batch_size, total_chunks)})...")
            identities = [hashlib.sha256((doc.metadata.get('source', '') + '\n' + doc.page_content).encode()).hexdigest() for doc in batch]
            vector_store.add_documents(batch, ids=identities)
        from app.ai.rag.retriever import clear_cache
        clear_cache()
        print("--- RAG INGESTION: Ingestion completed successfully! ---")
        return True
    except Exception as e:
        print(f"Unable to index knowledge documents ({type(e).__name__}). Check the embedding service and storage configuration.")

if __name__ == "__main__":
    sys.exit(0 if ingest_documents() else 1)
