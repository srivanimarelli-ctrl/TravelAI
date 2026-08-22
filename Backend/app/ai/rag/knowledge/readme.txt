TRAVELAI RAG KNOWLEDGE BASE
===========================

Place any travel guide text files (.txt) inside this directory.

Formatting guidelines:
1. Save files as plain text (.txt).
2. Write facts clearly. You can write about flights, hotels, attractions, weather, or transportation for any city.
3. Example filename: `goa_guide.txt`

To load the files into your ChromaDB vector database:
1. Open a terminal in the Backend directory.
2. Run this command:
   .\.venv\Scripts\python app/ai/rag/ingest.py
