import { redisService } from "../services/RedisService";

/**
 * This file exports the Redis service instance for use throughout the application.
 * The Redis service is responsible for:
 * 1. Managing connections to Redis
 * 2. Providing methods for basic Redis operations
 * 3. Handling chat history with TTL
 */

// Export the Redis service instance
export { redisService };

// Also export the Redis service class for cases where a new instance is needed
export { RedisService, type ChatMessage } from "../services/RedisService";
