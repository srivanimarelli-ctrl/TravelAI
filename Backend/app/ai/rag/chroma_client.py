"""Lazy optional Chroma store. Disabled RAG performs no database initialization."""
import threading
from app.ai.rag.config import settings

_lock = threading.Lock()
_store = None
_store_config = None


def get_vector_store():
    global _store, _store_config
    config = settings()
    if not config.enabled:
        return None
    with _lock:
        if _store is None or _store_config != config:
            from langchain_community.vectorstores import Chroma
            from chromadb.config import Settings
            from app.ai.rag.embedder import get_embeddings
            store = Chroma(collection_name='travel_knowledge',
                           embedding_function=get_embeddings(config),
                           client_settings=Settings(anonymized_telemetry=False, is_persistent=True),
                           persist_directory=config.persist_directory)
            _store, _store_config = store, config
        return _store
