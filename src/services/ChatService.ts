import { embeddingService, geminiService, redisService } from './index';
import { ChatMessage } from '../types';

/**
 * ChatService - A class-based service for handling chat interactions
 *
 * This class provides functionality to:
 * 1. Generate RAG-based responses
 * 2. Manage chat history in Redis
 * 3. Handle session management
 */
export class ChatService {
  /**
   * Creates a new instance of the ChatService
   */
  constructor() {}

  /**
   * Generates a response based on a query using RAG
   * @param sessionId The session ID
   * @param query The user's query
   * @returns The generated response
   */
  public async generateResponse(sessionId: string, query: string): Promise<string> {
    try {
      // Get relevant passages from the embedding collection
      const relevantPassage = await embeddingService.queryCollection(query);

      // Generate a response using the Gemini service with session support
      const response = await geminiService.generateResponseWithPassage(
        sessionId,
        query,
        relevantPassage
      );

      return response;
    } catch (error) {
      console.error("Error generating response:", error);
      throw new Error(`Failed to generate response: ${error}`);
    }
  }

  /**
   * Saves a chat interaction to Redis
   * @param sessionId The session ID
   * @param query The user's query
   * @param response The generated response
   * @returns A promise that resolves when the chat history is saved
   */
  public async saveChatInteraction(
    sessionId: string,
    query: string,
    response: string
  ): Promise<void> {
    try {
      // Get existing chat history
      const chatHistory = await this.getChatHistory(sessionId);

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
    } catch (error) {
      console.error("Error saving chat interaction:", error);
      throw new Error(`Failed to save chat interaction: ${error}`);
    }
  }

  /**
   * Gets chat history for a session
   * @param sessionId The session ID
   * @returns The chat messages
   */
  public async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    try {
      return await redisService.getChatHistory(sessionId);
    } catch (error) {
      console.error("Error getting chat history:", error);
      throw new Error(`Failed to get chat history: ${error}`);
    }
  }

  /**
   * Clears chat history for a session
   * @param sessionId The session ID
   * @returns A promise that resolves when the chat history is cleared
   */
  public async clearChatHistory(sessionId: string): Promise<void> {
    try {
      // Clear Redis chat history
      await redisService.clearChatHistory(sessionId);

      // Reset Gemini chat session
      geminiService.resetChatSession(sessionId);
    } catch (error) {
      console.error("Error clearing chat history:", error);
      throw new Error(`Failed to clear chat history: ${error}`);
    }
  }

  /**
   * Processes a chat request
   * @param sessionId The session ID
   * @param query The user's query
   * @returns The generated response
   */
  public async processChat(sessionId: string, query: string): Promise<string> {
    try {
      // Generate response with session support
      const response = await this.generateResponse(sessionId, query);

      // Save chat interaction
      await this.saveChatInteraction(sessionId, query, response);

      return response;
    } catch (error) {
      console.error("Error processing chat:", error);
      throw new Error(`Failed to process chat: ${error}`);
    }
  }
}
