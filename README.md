# NewsGPT: RAG-Powered Chatbot for News Websites

A full-stack chatbot application that answers queries over a news corpus using a Retrieval-Augmented Generation (RAG) pipeline. The application provides session-based chat interactions with an AI assistant that has knowledge of recent news articles.

## Features

- **RAG Pipeline**
  - Ingests ~50 news articles via RSS feeds
  - Uses Jina Embeddings SDK for text embedding
  - Stores embeddings in Chroma vector database
  - Retrieves relevant passages for each query
  - Generates responses using Google Gemini API

- **Backend (Express.js with TypeScript)**
  - REST API endpoints for chat interactions
  - Session-based chat history management
  - Endpoints to fetch session history and reset sessions
  - Redis for in-memory caching of chat history with 30-minute TTL

- **Frontend (React with Tailwind CSS)**
  - Clean, responsive chat interface
  - Displays message history
  - Input box for new messages
  - Streaming bot responses
  - Button to reset the current session

## Tech Stack

- **Embeddings**: Jina Embeddings SDK
- **Vector Database**: Chroma
- **LLM API**: Google Gemini
- **Backend**: Node.js with Express.js and TypeScript
- **Cache & Sessions**: Redis (in-memory)
- **Frontend**: React + Tailwind CSS

## Architecture

The application follows a clean, scalable architecture with proper separation of concerns:

1. **Data Ingestion Layer**
   - RSS feed parser for news article collection
   - Text chunking and preprocessing

2. **Embedding Layer**
   - Jina Embeddings SDK integration
   - Vector storage in Chroma DB

3. **Retrieval Layer**
   - Semantic search for relevant passages
   - Context preparation for LLM

4. **Generation Layer**
   - Google Gemini API integration
   - Response formatting and streaming

5. **Session Management**
   - Redis-based chat history storage
   - Session identification and tracking

## Setup and Installation

### Prerequisites
- Node.js (v16+)
- Redis server
- Google Gemini API key
- Jina Embeddings API key

### Backend Setup
1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure environment variables:
   ```
   cp .env.example .env
   ```
   Then edit the `.env` file with your API keys and configuration.

4. Start the development server:
   ```
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```

## API Endpoints

- `POST /api/chat`: Send a message and get a response
- `GET /api/session/history`: Get chat history for a session
- `POST /api/session/reset`: Reset chat history for a session
- `POST /api/refresh-embeddings`: Refresh the news embeddings database

## Caching Strategy

- Chat history is cached in Redis with a TTL of 30 minutes
- Session data is automatically cleared after the TTL expires
- Vector embeddings are persisted in Chroma DB for long-term storage

## Future Improvements

- Add support for multiple news sources
- Implement user authentication
- Add analytics for tracking popular queries
- Optimize embedding model for better retrieval accuracy
- Add support for multimedia content in responses

## License

[MIT License](LICENSE)
