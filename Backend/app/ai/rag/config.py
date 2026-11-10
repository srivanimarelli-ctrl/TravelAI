"""Deployment-safe RAG settings; importing these never opens a vector database."""
import os
from dataclasses import dataclass
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[3]


def _number(name, default, minimum, maximum):
    try:
        value = float(os.getenv(name, str(default)))
        return value if minimum <= value <= maximum else default
    except (TypeError, ValueError):
        return default


@dataclass(frozen=True)
class RagSettings:
    enabled: bool
    persist_directory: str
    ollama_url: str
    timeout_seconds: float
    cooldown_seconds: float
    cache_seconds: float
    cache_size: int
    max_context_chars: int


def settings():
    directory = Path(os.getenv('CHROMA_PERSIST_DIR', '').strip() or BACKEND_ROOT / 'chromadb_storage').expanduser()
    if not directory.is_absolute():
        directory = BACKEND_ROOT / directory
    return RagSettings(
        enabled=os.getenv('RAG_ENABLED', 'false').strip().lower() in {'1', 'true', 'yes', 'on'},
        persist_directory=str(directory.resolve()),
        ollama_url=os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434').strip(),
        timeout_seconds=_number('RAG_TIMEOUT_SECONDS', 3, 0.1, 30),
        cooldown_seconds=_number('RAG_FAILURE_COOLDOWN_SECONDS', 60, 1, 3600),
        cache_seconds=_number('RAG_CACHE_TTL_SECONDS', 300, 1, 3600),
        cache_size=int(_number('RAG_CACHE_SIZE', 128, 1, 512)),
        max_context_chars=int(_number('RAG_MAX_CONTEXT_CHARS', 6000, 256, 20000)),
    )
