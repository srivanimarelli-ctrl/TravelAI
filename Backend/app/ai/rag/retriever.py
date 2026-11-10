"""Optional, bounded guide retrieval with shared caching and failure cooldown."""
import logging
import threading
import time
from collections import OrderedDict
from app.ai.rag.config import settings

logger = logging.getLogger('travelai.rag')
_lock = threading.RLock()
_cache = OrderedDict()
_retry_after = {}


def clear_cache():
    """Explicit ingestion invalidation; never changes stored knowledge or trips."""
    with _lock:
        _cache.clear()
        _retry_after.clear()


def retrieve_travel_knowledge(query: str, k: int = 2) -> str:
    config = settings()
    if not config.enabled or not isinstance(query, str) or not query.strip():
        return ''
    query = ' '.join(query.split())[:2000]
    try:
        count = max(1, min(8, int(k)))
    except (TypeError, ValueError, OverflowError):
        count = 2
    key = (config, query, count)
    # Coalesce equal lookups; the existing single-worker demo bounds concurrency.
    with _lock:
        now = time.monotonic()
        if now < _retry_after.get(config, 0):
            return ''
        for old_key in [key for key, (deadline, _) in _cache.items() if deadline <= now]:
            del _cache[old_key]
        if key in _cache:
            _cache.move_to_end(key)
            return _cache[key][1]
        try:
            from app.ai.rag.chroma_client import get_vector_store
            store = get_vector_store()
            # An empty local index needs ingestion, not an embedding API request.
            if store is None or store._collection.count() == 0:
                result = ''
            else:
                docs = store.similarity_search(query, k=count)
                snippets, seen = [], set()
                remaining = config.max_context_chars
                for doc in docs:
                    text = str(doc.page_content or '').strip()
                    if not text or text in seen:
                        continue
                    seen.add(text)
                    text = text[:remaining]
                    snippets.append(text)
                    remaining -= len(text) + 1
                    if remaining <= 0:
                        break
                result = '\n'.join(snippets)[:config.max_context_chars]
            _cache[key] = (time.monotonic() + config.cache_seconds, result)
            while len(_cache) > config.cache_size:
                _cache.popitem(last=False)
            return result
        except Exception as error:
            # Never log user queries, credentials, endpoint URLs or provider text.
            logger.warning('Guide retrieval unavailable (%s); planning continues without retrieved context.', type(error).__name__)
            _retry_after.clear()
            _retry_after[config] = time.monotonic() + config.cooldown_seconds
            return ''
