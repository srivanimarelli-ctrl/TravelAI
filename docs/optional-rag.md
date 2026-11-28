# Optional guide retrieval for deployment

TravelAI's Groq planning/chat, live discovery, maps, saved trips, demo payments and Companion workflows do not require Ollama. Regional guide retrieval is now an explicit optional capability, disabled by default.

## Basic cloud deployment

Install `Backend/requirements.txt` and set:

```dotenv
RAG_ENABLED=false
```

Disabled retrieval returns no guide context immediately. It does not import the optional vector/embedding packages, initialize Chroma, create a persistence directory, seed knowledge or contact Ollama. No Ollama URL or local embedding model is required for this mode. Groq credentials and the MongoDB connection are still required by the application.

Q&A that lacks live/retrieved information is instructed to label any answer as general guidance. It must not claim a source was retrieved or current prices/availability were verified. This is a change in available context, not a replacement source of live travel data.

## Enable regional guides

From `Backend`, install the optional dependencies:

```text
python -m pip install -r requirements-rag.txt
```

Configure the backend environment:

```dotenv
RAG_ENABLED=true
OLLAMA_BASE_URL=http://localhost:11434
CHROMA_PERSIST_DIR=
RAG_TIMEOUT_SECONDS=3
RAG_FAILURE_COOLDOWN_SECONDS=60
RAG_CACHE_TTL_SECONDS=300
RAG_CACHE_SIZE=128
RAG_MAX_CONTEXT_CHARS=6000
```

Start Ollama and install the existing `nomic-embed-text` model. Then explicitly ingest the supplied guides:

```text
ollama pull nomic-embed-text
python -m app.ai.rag.ingest
```

The command exits unsuccessfully with an actionable message when retrieval is disabled or ingestion fails. Importing the ingestion module does not initialize storage. Ingestion retains the existing document-ID calculation so repeated identical documents do not create new IDs, and successful ingestion clears the in-process query cache. It never seeds the old synthetic travel-advice examples automatically.

## Storage compatibility

An empty `CHROMA_PERSIST_DIR` keeps the existing `Backend/chromadb_storage` location and `travel_knowledge` collection. Relative paths resolve from `Backend`, independently of the process working directory. On a cloud host, use an absolute directory on a mounted persistent disk, for example `/var/data/travelai/chroma`, and provide a reachable embedding service; `localhost` points to that cloud machine, not your laptop.

Existing Chroma data, source guides and MongoDB records are not removed, rewritten or re-embedded by this change. No automatic migration occurs. The embedding model remains `nomic-embed-text` to preserve the existing index's dimensions/meaning. Changing an embedding model in future requires a separate compatible index and ingestion plan.

## Retrieval behavior

- Initialize Chroma and its embedding client only on the first enabled lookup.
- Use a real HTTP-client timeout for embedding requests. This bounds network calls, not all CPU work or time waiting for another lookup.
- Skip embedding requests for an empty index; ingest guides explicitly instead.
- Normalize whitespace and cache equal query/count/configuration combinations. Concurrent identical lookups share the result under a process-local lock.
- Cache results for five minutes by default, including empty-index results; retain at most 128 entries.
- Deduplicate text chunks, cap results to eight chunks and cap returned guide context to 6,000 characters by default.
- Fail safely on unavailable optional packages, inaccessible storage or embedding-service failures. A 60-second cooldown avoids repeated failing calls; later requests can recover.
- Log the failure class without user queries, credential-bearing endpoints or raw provider exceptions.

Caches and cooldowns are process-local. Continue the project's single-worker demo deployment. Retrieval is reference material, not a guarantee of current venue hours, weather or prices.

The optional stack retains the existing LangChain community Chroma wrapper to avoid an unrelated dependency/index migration. Its upstream deprecation warning can still appear when RAG is enabled; it is not imported in the core-only deployment.

## Checks

`python rag_tests.py` covers disabled/default configuration, startup with optional imports blocked (both disabled and enabled-but-missing-dependency configurations), enabled retrieval/cache expiry, concurrent lookup sharing, bounded context, empty indexes, failure cooldown/recovery, storage paths, HTTP timeout propagation, ingestion gating and honest Q&A fallback. With optional packages installed, an isolated real Chroma test checks storage/retrieval using deterministic offline embeddings, without changing the existing index or calling Ollama. `python run_regressions.py` includes this suite with the existing planning, booking/payment and Companion/rerouting checks.

CI now checks the core backend on Windows and Ubuntu, plus the optional retrieval dependencies on Ubuntu. These cloud jobs run on the next push; local verification does not claim they have already run.
