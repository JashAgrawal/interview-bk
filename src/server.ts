import express from 'express';
import { Request, Response } from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { generateRagBasedResponse } from './scripts/setup';
import { embeddingService } from './config/embeddingService';
import { redisService, ChatMessage } from './config/redis';

// Load environment variables
dotenv.config();

// Create Express application
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(morgan('dev')); // Request logger
app.use(express.json()); // Parse JSON bodies

// Initialize services
(async () => {
  try {
    // Initialize embedding service
    console.log('Initializing embedding service...');
    await embeddingService.initialize();
    console.log('Embedding service initialized successfully');

    // Initialize Redis service
    console.log('Initializing Redis service...');
    await redisService.connect();
    console.log('Redis service initialized successfully');
  } catch (error) {
    console.error('Failed to initialize services:', error);
  }
})();

// Simple endpoint
app.get('/api/hello', async (_req: Request, res: Response) => {
  const response = await generateRagBasedResponse("What do you know about Jeremy Renner ?");
  console.log(response);
  res.json({
    message: 'Hello from the TypeScript Express Server!',
    timestamp: new Date().toISOString()
  });
});

// Helper function to get or create session ID
const getSessionId = (req: Request): string => {
  // Check for session ID in headers
  let sessionId = req.headers['x-session-id'] as string;

  // If no session ID, generate a new one
  if (!sessionId) {
    sessionId = uuidv4();
  }

  return sessionId;
};

// Chat endpoint
app.post('/api/chat', (req, res) => {
  (async () => {
    try {
      const { query } = req.body;
      const sessionId = getSessionId(req);

      if (!query) {
        return res.status(400).json({ error: 'Query is required' });
      }

      // Generate response
      const response = await generateRagBasedResponse(query);

      // Get existing chat history
      const chatHistory = await redisService.getChatHistory(sessionId);

      // Add new messages to history
      const userMessage: ChatMessage = {
        role: 'user',
        content: query,
        timestamp: Date.now()
      };

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      };

      chatHistory.push(userMessage, assistantMessage);

      // Save updated chat history
      await redisService.saveChatHistory(sessionId, chatHistory);

      res.json({
        sessionId,
        response,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error processing chat request:', error);
      res.status(500).json({ error: 'Failed to process chat request' });
    }
  })();
});

// Refresh embeddings endpoint
app.post('/api/refresh-embeddings', (_req, res) => {
  (async () => {
    try {
      console.log('Refreshing embeddings...');
      await embeddingService.initialize(true);
      console.log('Embeddings refreshed successfully');

      res.json({
        message: 'Embeddings refreshed successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error refreshing embeddings:', error);
      res.status(500).json({ error: 'Failed to refresh embeddings' });
    }
  })();
});

// Session history endpoint
app.get('/api/session/history', (req, res) => {
  (async () => {
    try {
      const sessionId = getSessionId(req);

      // Get chat history for the session
      const chatHistory = await redisService.getChatHistory(sessionId);

      res.json({
        sessionId,
        history: chatHistory,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error retrieving session history:', error);
      res.status(500).json({ error: 'Failed to retrieve session history' });
    }
  })();
});

// Reset session endpoint
app.post('/api/session/reset', (req, res) => {
  (async () => {
    try {
      const sessionId = getSessionId(req);

      // Clear chat history for the session
      await redisService.clearChatHistory(sessionId);

      res.json({
        sessionId,
        message: 'Session reset successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error resetting session:', error);
      res.status(500).json({ error: 'Failed to reset session' });
    }
  })();
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');

  try {
    // Disconnect Redis
    await redisService.disconnect();
    console.log('Redis disconnected');

    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

export default app;
