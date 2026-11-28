"""Optional retrieval, bounded failures, caching and dependency-free startup."""
import json
import importlib.util
import os
import subprocess
import sys
import tempfile
import threading
import unittest
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import MagicMock, patch
from app.ai.rag import config, chroma_client, retriever


class RagTests(unittest.TestCase):
    def setUp(self):
        env = patch.dict(os.environ, {'RAG_ENABLED': 'true', 'CHROMA_PERSIST_DIR': '',
            'RAG_TIMEOUT_SECONDS': '3', 'RAG_FAILURE_COOLDOWN_SECONDS': '60',
            'RAG_CACHE_TTL_SECONDS': '300', 'RAG_CACHE_SIZE': '128', 'RAG_MAX_CONTEXT_CHARS': '6000'})
        env.start(); self.addCleanup(env.stop)
        retriever.clear_cache()
        self.addCleanup(retriever.clear_cache)
        self.store = MagicMock()
        self.store._collection.count.return_value = 3
        self.store.similarity_search.return_value = [SimpleNamespace(page_content='Saved guide context')]
        store = patch.object(chroma_client, 'get_vector_store', return_value=self.store)
        store.start(); self.addCleanup(store.stop)

    def test_disabled_retrieval_does_not_initialize_or_contact_any_service(self):
        with patch.dict(os.environ, RAG_ENABLED='false'), patch.object(chroma_client, 'get_vector_store') as loader:
            self.assertEqual(retriever.retrieve_travel_knowledge('Goa'), '')
        loader.assert_not_called()

    def test_disabled_is_the_default_and_invalid_flags_fail_closed(self):
        with patch.dict(os.environ):
            os.environ.pop('RAG_ENABLED', None)
            self.assertFalse(config.settings().enabled)
        with patch.dict(os.environ, RAG_ENABLED='not-a-boolean'):
            self.assertFalse(config.settings().enabled)

    def test_enabled_guide_results_are_cached_and_whitespace_is_normalized(self):
        self.assertEqual(retriever.retrieve_travel_knowledge(' Goa   nature '), 'Saved guide context')
        self.assertEqual(retriever.retrieve_travel_knowledge('Goa nature'), 'Saved guide context')
        self.store.similarity_search.assert_called_once_with('Goa nature', k=2)

    def test_cache_expires_and_ingestion_can_invalidate_it(self):
        with patch.object(retriever.time, 'monotonic', return_value=10):
            retriever.retrieve_travel_knowledge('Goa')
        with patch.object(retriever.time, 'monotonic', return_value=311):
            retriever.retrieve_travel_knowledge('Goa')
        retriever.clear_cache(); retriever.retrieve_travel_knowledge('Goa')
        self.assertEqual(self.store.similarity_search.call_count, 3)

    def test_cache_and_output_have_hard_size_limits(self):
        with patch.dict(os.environ, RAG_CACHE_SIZE='2', RAG_MAX_CONTEXT_CHARS='256'):
            self.store.similarity_search.return_value = [SimpleNamespace(page_content='x' * 500)]
            for query in ['a', 'b', 'c']:
                self.assertEqual(len(retriever.retrieve_travel_knowledge(query)), 256)
            self.assertEqual(len(retriever._cache), 2)

    def test_duplicate_chunks_and_empty_content_are_removed(self):
        self.store.similarity_search.return_value = [SimpleNamespace(page_content=t) for t in ['same', ' same ', '', 'other']]
        self.assertEqual(retriever.retrieve_travel_knowledge('Goa'), 'same\nother')

    def test_empty_index_does_not_request_embeddings(self):
        self.store._collection.count.return_value = 0
        self.assertEqual(retriever.retrieve_travel_knowledge('Goa'), '')
        self.store.similarity_search.assert_not_called()

    def test_dependency_or_provider_failure_is_safe_and_has_cooldown(self):
        self.store.similarity_search.side_effect = ConnectionError('https://user:secret@private-host/query')
        with patch.object(retriever.time, 'monotonic', return_value=10), self.assertLogs('travelai.rag', level='WARNING') as logs:
            self.assertEqual(retriever.retrieve_travel_knowledge('private traveler query'), '')
            self.assertEqual(retriever.retrieve_travel_knowledge('different query'), '')
        self.assertEqual(self.store.similarity_search.call_count, 1)
        self.assertNotIn('secret', str(logs.output)); self.assertNotIn('private traveler', str(logs.output))
        self.store.similarity_search.side_effect = None
        with patch.object(retriever.time, 'monotonic', return_value=71):
            self.assertEqual(retriever.retrieve_travel_knowledge('Goa'), 'Saved guide context')

    def test_missing_optional_packages_do_not_break_qa(self):
        with patch.object(chroma_client, 'get_vector_store', side_effect=ModuleNotFoundError('optional dependency')):
            self.assertEqual(retriever.retrieve_travel_knowledge('Goa'), '')

    def test_cache_is_isolated_by_storage_configuration_and_result_count(self):
        retriever.retrieve_travel_knowledge('Goa', 2)
        retriever.retrieve_travel_knowledge('Goa', 3)
        with patch.dict(os.environ, CHROMA_PERSIST_DIR='other-index'):
            retriever.retrieve_travel_knowledge('Goa', 2)
        self.assertEqual(self.store.similarity_search.call_count, 3)

    def test_empty_queries_and_invalid_limits_are_bounded(self):
        self.assertEqual(retriever.retrieve_travel_knowledge('   '), '')
        self.assertEqual(retriever.retrieve_travel_knowledge(None), '')
        retriever.retrieve_travel_knowledge('Goa', 999)
        self.store.similarity_search.assert_called_with('Goa', k=8)
        retriever.retrieve_travel_knowledge('Goa', 'bad')
        self.store.similarity_search.assert_called_with('Goa', k=2)

    def test_equal_concurrent_requests_share_the_lookup(self):
        started, release = threading.Event(), threading.Event()
        def lookup(*args, **kwargs):
            started.set(); release.wait(3)
            return [SimpleNamespace(page_content='one result')]
        self.store.similarity_search.side_effect = lookup
        with ThreadPoolExecutor(max_workers=2) as pool:
            first = pool.submit(retriever.retrieve_travel_knowledge, 'Goa')
            self.assertTrue(started.wait(2))
            second = pool.submit(retriever.retrieve_travel_knowledge, 'Goa')
            release.set()
            self.assertEqual(first.result(), second.result())
        self.assertEqual(self.store.similarity_search.call_count, 1)

    def test_storage_defaults_preserve_existing_database_and_resolve_relative_paths(self):
        self.assertEqual(config.settings().persist_directory, str(config.BACKEND_ROOT / 'chromadb_storage'))
        with patch.dict(os.environ, CHROMA_PERSIST_DIR='persistent/guides'):
            self.assertEqual(config.settings().persist_directory, str(config.BACKEND_ROOT / 'persistent/guides'))

    def test_invalid_numeric_settings_cannot_cause_unbounded_waits_or_caches(self):
        with patch.dict(os.environ, RAG_TIMEOUT_SECONDS='nan', RAG_CACHE_SIZE='999999', RAG_CACHE_TTL_SECONDS='bad', RAG_MAX_CONTEXT_CHARS='-1'):
            settings = config.settings()
            self.assertEqual(settings.timeout_seconds, 3)
            self.assertEqual(settings.cache_size, 128)
            self.assertEqual(settings.cache_seconds, 300)
            self.assertEqual(settings.max_context_chars, 6000)

    def test_embedding_client_receives_real_http_timeout(self):
        from app.ai.rag.embedder import get_embeddings
        constructor = MagicMock()
        with patch.dict(sys.modules, {'langchain_ollama': SimpleNamespace(OllamaEmbeddings=constructor)}):
            get_embeddings(config.settings())
        self.assertEqual(constructor.call_args.kwargs['client_kwargs'], {'timeout': 3})
        self.assertEqual(constructor.call_args.kwargs['model'], 'nomic-embed-text')

    def test_disabled_ingestion_does_not_create_storage_or_import_optional_libraries(self):
        from app.ai.rag.ingest import ingest_documents
        with patch.dict(os.environ, RAG_ENABLED='false'), patch.object(chroma_client, 'get_vector_store') as store:
            self.assertFalse(ingest_documents())
        store.assert_not_called()

    def test_qa_without_retrieval_labels_general_guidance_and_does_not_claim_a_source(self):
        from app.services import qa_service
        response = SimpleNamespace(content='General guidance: check with the provider.')
        with patch.dict(os.environ, RAG_ENABLED='false'), patch.object(qa_service.llm, 'invoke', return_value=response) as llm:
            self.assertEqual(qa_service.handle_travel_qa('What can I do?', {'destination': 'Goa'}), response.content)
        prompt = ' '.join(str(item.content) for item in llm.call_args.args[0])
        self.assertIn('No verified live or retrieved information', prompt)
        self.assertIn('general guidance', prompt)

    def test_application_import_and_readiness_without_any_rag_dependencies(self):
        script = '''
import importlib.abc, sys, os
from unittest.mock import MagicMock, patch
class NoRag(importlib.abc.MetaPathFinder):
    def find_spec(self, fullname, *args):
        if fullname.split('.')[0] in {'chromadb', 'langchain_community', 'langchain_ollama', 'langchain_text_splitters'}:
            raise ModuleNotFoundError('Optional RAG package intentionally unavailable')
sys.meta_path.insert(0, NoRag())
from app import main
from fastapi.testclient import TestClient
from app.ai.rag.retriever import retrieve_travel_knowledge
with patch.object(main, 'client', MagicMock()):
    assert TestClient(main.app).get('/health/ready').status_code == 200
assert retrieve_travel_knowledge('Goa') == ''
for prefix in ['chromadb', 'langchain_community', 'langchain_ollama']:
    assert not any(n == prefix or n.startswith(prefix+'.') for n in sys.modules)
print('CORE_ONLY_STARTUP_OK')
'''
        for enabled in ('false', 'true'):
            env = dict(os.environ, RAG_ENABLED=enabled, GROQ_API_KEY='test-only', MONGODB_URI='mongodb://127.0.0.1:27017')
            result = subprocess.run([sys.executable, '-c', script], cwd=Path(__file__).parent, env=env,
                                    capture_output=True, text=True, timeout=30)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertIn('CORE_ONLY_STARTUP_OK', result.stdout)

    @unittest.skipUnless(importlib.util.find_spec('chromadb') and importlib.util.find_spec('langchain_community'), 'Optional RAG dependencies not installed')
    def test_real_chroma_factory_preserves_its_index_and_caches_enabled_retrieval(self):
        # Isolated child process releases native Chroma handles before cleanup.
        # No real guides, existing index, MongoDB or provider credentials are used.
        script = '''
import os
from unittest.mock import patch
from langchain_core.embeddings import Embeddings
from app.ai.rag import chroma_client, retriever
class OfflineEmbeddings(Embeddings):
    queries = 0
    def embed_documents(self, texts): return [[1.0, 0.0, 0.0] for _ in texts]
    def embed_query(self, text):
        self.queries += 1
        return [1.0, 0.0, 0.0]
embeddings = OfflineEmbeddings()
with patch('app.ai.rag.embedder.get_embeddings', return_value=embeddings) as factory:
    store = chroma_client.get_vector_store()
    store.add_texts(['Isolated Goa guide fixture'], ids=['fixture-goa'])
    assert chroma_client.get_vector_store() is store
    assert factory.call_count == 1
    assert retriever.retrieve_travel_knowledge('Goa fixture') == 'Isolated Goa guide fixture'
    assert retriever.retrieve_travel_knowledge('Goa fixture') == 'Isolated Goa guide fixture'
    assert embeddings.queries == 1
    os.environ['RAG_ENABLED'] = 'false'
    assert retriever.retrieve_travel_knowledge('Goa fixture') == ''
    assert store._collection.count() == 1
print('REAL_CHROMA_OPTIONAL_OK')
'''
        with tempfile.TemporaryDirectory(prefix='travelai-rag-test-') as directory:
            env = dict(os.environ, RAG_ENABLED='true', CHROMA_PERSIST_DIR=directory, ANONYMIZED_TELEMETRY='False')
            result = subprocess.run([sys.executable, '-c', script], cwd=Path(__file__).parent, env=env,
                                    capture_output=True, text=True, timeout=30)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn('REAL_CHROMA_OPTIONAL_OK', result.stdout)


if __name__ == '__main__':
    unittest.main()
