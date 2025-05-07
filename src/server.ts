import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { config } from './config';
import routes from './routes';
import { embeddingService, redisService } from './services';

// Load environment variables
dotenv.config();

// Create Express application
const app = express();
const PORT = config.PORT;

// Middleware
app.use(morgan('dev')); // Request logger
app.use(express.json()); // Parse JSON bodies

// Mount routes
app.use(routes);

// Initialize services
const initializeServices = async (): Promise<void> => {
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
    process.exit(1);
  }
};

// Start the server
const startServer = async (): Promise<void> => {
  await initializeServices();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

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

// Start the server
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export default app;
