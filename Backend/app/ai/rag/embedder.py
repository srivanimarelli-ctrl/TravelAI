"""Create the optional embedding client only when retrieval is explicitly enabled."""


def get_embeddings(config):
    from langchain_ollama import OllamaEmbeddings
    return OllamaEmbeddings(
        base_url=config.ollama_url,
        model='nomic-embed-text',  # Preserve compatibility with existing indexed guides.
        client_kwargs={'timeout': config.timeout_seconds},
    )
