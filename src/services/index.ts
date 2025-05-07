/**
 * Service exports
 */
import { EmbeddingService } from './EmbeddingService';
import { GeminiService } from './GeminiService';
import { RedisService } from './RedisService';
import { ChatService } from './ChatService';

// Create singleton instances
export const embeddingService = new EmbeddingService();
export const geminiService = new GeminiService();
export const redisService = new RedisService();
export const chatService = new ChatService();

// Export classes for cases where new instances are needed
export { EmbeddingService, GeminiService, RedisService, ChatService };
