# NewsGPT API Documentation

This document provides comprehensive information for frontend developers to integrate with the NewsGPT backend API. NewsGPT is an AI chatbot for news websites that uses Retrieval-Augmented Generation (RAG) to answer queries based on news articles.

## Table of Contents

1. [API Overview](#api-overview)
2. [Base URL](#base-url)
3. [Authentication](#authentication)
4. [Session Management](#session-management)
5. [API Endpoints](#api-endpoints)
   - [Chat](#chat)
   - [Session History](#session-history)
   - [Session Reset](#session-reset)
   - [Refresh Embeddings](#refresh-embeddings)
6. [Data Models](#data-models)
7. [Error Handling](#error-handling)
8. [Example Usage](#example-usage)
9. [Best Practices](#best-practices)

## API Overview

The NewsGPT API provides endpoints for:
- Sending chat messages and receiving AI-generated responses
- Retrieving chat history for a session
- Resetting a chat session
- Refreshing the news embeddings database (admin functionality)

All API responses are in JSON format.

## Base URL

```
http://localhost:3000/api
```

The port may vary based on the server configuration. Check with your backend team for the correct port if needed.

## Authentication

The API currently does not require authentication. Sessions are managed through session IDs.

## Session Management

### Session ID

- Each user session is identified by a unique session ID
- The session ID is generated on the first request if not provided
- Frontend should store and send this session ID with each subsequent request
- Session ID is sent via the `x-session-id` HTTP header

### Session Persistence

- Chat history is stored in Redis with a TTL of 30 minutes
- If a user doesn't interact for 30 minutes, their chat history will be cleared
- Frontend should handle cases where session data might be lost

## API Endpoints

### Chat

Send a user query and receive an AI-generated response.

**Endpoint:** `POST /api/chat`

**Request Body:**
```json
{
  "query": "What are the latest news about climate change?"
}
```

**Headers:**
```
x-session-id: <session-id> (optional on first request, required for subsequent requests)
Content-Type: application/json
```

**Response:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "response": "According to recent news, climate change initiatives are accelerating globally with new policies being implemented in several countries...",
  "timestamp": "2023-06-15T14:30:45.123Z"
}
```

**Status Codes:**
- `200 OK`: Request successful
- `400 Bad Request`: Missing query parameter
- `500 Internal Server Error`: Server error

### Session History

Retrieve the chat history for the current session.

**Endpoint:** `GET /api/session/history`

**Headers:**
```
x-session-id: <session-id>
```

**Response:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "history": [
    {
      "role": "user",
      "content": "What are the latest news about climate change?",
      "timestamp": 1686837045123
    },
    {
      "role": "assistant",
      "content": "According to recent news, climate change initiatives are accelerating globally with new policies being implemented in several countries...",
      "timestamp": 1686837046123
    }
  ],
  "timestamp": "2023-06-15T14:30:47.123Z"
}
```

**Status Codes:**
- `200 OK`: Request successful
- `500 Internal Server Error`: Server error

### Session Reset

Reset the chat history for the current session.

**Endpoint:** `POST /api/session/reset`

**Headers:**
```
x-session-id: <session-id>
```

**Response:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Session reset successfully",
  "timestamp": "2023-06-15T14:35:45.123Z"
}
```

**Status Codes:**
- `200 OK`: Request successful
- `500 Internal Server Error`: Server error

### Refresh Embeddings

Refresh the news embeddings database (admin functionality).

**Endpoint:** `POST /api/refresh-embeddings`

**Response:**
```json
{
  "message": "Embeddings refreshed successfully",
  "timestamp": "2023-06-15T14:40:45.123Z"
}
```

**Status Codes:**
- `200 OK`: Request successful
- `500 Internal Server Error`: Server error

## Data Models

### ChatMessage

```typescript
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number; // Unix timestamp in milliseconds
}
```

### ChatResponse

```typescript
interface ChatResponse {
  sessionId: string;
  response: string;
  timestamp: string; // ISO string
}
```

### SessionHistoryResponse

```typescript
interface SessionHistoryResponse {
  sessionId: string;
  history: ChatMessage[];
  timestamp: string; // ISO string
}
```

### SessionResetResponse

```typescript
interface SessionResetResponse {
  sessionId: string;
  message: string;
  timestamp: string; // ISO string
}
```

### ErrorResponse

```typescript
interface ErrorResponse {
  error: string;
}
```

## Error Handling

All API endpoints return standard HTTP status codes:

- `200`: Success
- `400`: Bad Request (e.g., missing required parameters)
- `500`: Internal Server Error

Error responses include an `error` field with a description:

```json
{
  "error": "Failed to process chat request"
}
```

Frontend applications should handle these errors gracefully and display appropriate messages to users.

## Example Usage

### JavaScript/TypeScript Example with Axios

```typescript
import axios from 'axios';

// Base URL for API
const API_BASE_URL = 'http://localhost:3000/api';

// Get session ID from localStorage or create a new one
let sessionId = localStorage.getItem('newsGptSessionId');

// Axios instance with default headers
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add session ID to requests
api.interceptors.request.use((config) => {
  if (sessionId) {
    config.headers['x-session-id'] = sessionId;
  }
  return config;
});

// Save session ID from responses
api.interceptors.response.use((response) => {
  if (response.data.sessionId) {
    sessionId = response.data.sessionId;
    localStorage.setItem('newsGptSessionId', sessionId);
  }
  return response;
});

// Send a chat message
async function sendChatMessage(query) {
  try {
    const response = await api.post('/chat', { query });
    return response.data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}

// Get chat history
async function getChatHistory() {
  try {
    const response = await api.get('/session/history');
    return response.data;
  } catch (error) {
    console.error('Error getting chat history:', error);
    throw error;
  }
}

// Reset chat session
async function resetChatSession() {
  try {
    const response = await api.post('/session/reset');
    return response.data;
  } catch (error) {
    console.error('Error resetting chat session:', error);
    throw error;
  }
}
```

## Best Practices

1. **Session Management**:
   - Store the session ID in localStorage or sessionStorage
   - Include the session ID in all requests via the `x-session-id` header
   - Handle cases where the session might expire

2. **Error Handling**:
   - Implement proper error handling for all API calls
   - Display user-friendly error messages
   - Consider implementing retry logic for transient errors

3. **UI/UX Considerations**:
   - Show loading indicators during API calls
   - Implement typing indicators for a more natural chat experience
   - Display chat history in a conversational format
   - Provide a clear way for users to reset their session

4. **Performance**:
   - Implement debouncing for user input to prevent excessive API calls
   - Consider caching responses for frequently asked questions
   - Optimize rendering of chat history for large conversations
