import { createClient, RedisClientType } from "redis";
import { config } from "../config/env";

/**
 * Message type for chat history
 */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

/**
 * RedisService - A class-based service for interacting with Redis
 * 
 * This class provides functionality to:
 * 1. Connect to and disconnect from Redis
 * 2. Perform basic Redis operations (get, set, delete)
 * 3. Manage chat history with TTL
 * 4. Handle Redis errors and reconnection
 */
export class RedisService {
  private client: RedisClientType | null = null;
  private isConnected: boolean = false;
  private readonly defaultTTL: number = 1800; // 30 minutes in seconds

  /**
   * Creates a new instance of the RedisService
   * @param redisUrl Optional Redis URL (defaults to the one in environment config)
   */
  constructor(redisUrl: string = config.REDIS_URL) {
    this.initialize(redisUrl);
  }

  /**
   * Initializes the Redis client
   * @param redisUrl The Redis URL to connect to
   * @private
   */
  private initialize(redisUrl: string): void {
    this.client = createClient({ url: redisUrl });
    
    this.client.on("error", (err) => {
      console.error("Redis Client Error:", err);
      this.isConnected = false;
    });

    this.client.on("connect", () => {
      console.log("Redis client connected");
      this.isConnected = true;
    });

    this.client.on("end", () => {
      console.log("Redis client disconnected");
      this.isConnected = false;
    });
  }

  /**
   * Connects to Redis if not already connected
   * @returns A promise that resolves when connected
   */
  public async connect(): Promise<void> {
    if (!this.client) {
      throw new Error("Redis client not initialized");
    }

    if (!this.isConnected) {
      try {
        await this.client.connect();
      } catch (error) {
        console.error("Failed to connect to Redis:", error);
        throw new Error(`Failed to connect to Redis: ${error}`);
      }
    }
  }

  /**
   * Disconnects from Redis
   * @returns A promise that resolves when disconnected
   */
  public async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      try {
        await this.client.disconnect();
      } catch (error) {
        console.error("Failed to disconnect from Redis:", error);
        throw new Error(`Failed to disconnect from Redis: ${error}`);
      }
    }
  }

  /**
   * Gets a value from Redis
   * @param key The key to get
   * @returns The value or null if not found
   */
  public async get(key: string): Promise<string | null> {
    if (!this.client) {
      throw new Error("Redis client not initialized");
    }

    if (!this.isConnected) {
      await this.connect();
    }

    try {
      return await this.client.get(key);
    } catch (error) {
      console.error(`Error getting key ${key} from Redis:`, error);
      throw new Error(`Failed to get key ${key} from Redis: ${error}`);
    }
  }

  /**
   * Sets a value in Redis with optional TTL
   * @param key The key to set
   * @param value The value to set
   * @param ttl Optional TTL in seconds (defaults to 30 minutes)
   * @returns A promise that resolves when the value is set
   */
  public async set(key: string, value: string, ttl: number = this.defaultTTL): Promise<void> {
    if (!this.client) {
      throw new Error("Redis client not initialized");
    }

    if (!this.isConnected) {
      await this.connect();
    }

    try {
      await this.client.set(key, value, { EX: ttl });
    } catch (error) {
      console.error(`Error setting key ${key} in Redis:`, error);
      throw new Error(`Failed to set key ${key} in Redis: ${error}`);
    }
  }

  /**
   * Deletes a key from Redis
   * @param key The key to delete
   * @returns A promise that resolves when the key is deleted
   */
  public async delete(key: string): Promise<void> {
    if (!this.client) {
      throw new Error("Redis client not initialized");
    }

    if (!this.isConnected) {
      await this.connect();
    }

    try {
      await this.client.del(key);
    } catch (error) {
      console.error(`Error deleting key ${key} from Redis:`, error);
      throw new Error(`Failed to delete key ${key} from Redis: ${error}`);
    }
  }

  /**
   * Saves chat history for a session
   * @param sessionId The session ID
   * @param messages The chat messages
   * @param ttl Optional TTL in seconds (defaults to 30 minutes)
   * @returns A promise that resolves when the chat history is saved
   */
  public async saveChatHistory(
    sessionId: string, 
    messages: ChatMessage[], 
    ttl: number = this.defaultTTL
  ): Promise<void> {
    const key = `chat:${sessionId}`;
    const value = JSON.stringify(messages);
    await this.set(key, value, ttl);
  }

  /**
   * Gets chat history for a session
   * @param sessionId The session ID
   * @returns The chat messages or an empty array if not found
   */
  public async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    const key = `chat:${sessionId}`;
    const value = await this.get(key);
    
    if (!value) {
      return [];
    }

    try {
      return JSON.parse(value) as ChatMessage[];
    } catch (error) {
      console.error(`Error parsing chat history for session ${sessionId}:`, error);
      return [];
    }
  }

  /**
   * Clears chat history for a session
   * @param sessionId The session ID
   * @returns A promise that resolves when the chat history is cleared
   */
  public async clearChatHistory(sessionId: string): Promise<void> {
    const key = `chat:${sessionId}`;
    await this.delete(key);
  }

  /**
   * Checks if Redis is connected
   * @returns Whether Redis is connected
   */
  public isRedisConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Gets the Redis client
   * @returns The Redis client
   */
  public getClient(): RedisClientType | null {
    return this.client;
  }
}

// Export a singleton instance for use throughout the application
export const redisService = new RedisService();

// Also export the class for cases where a new instance is needed
export default RedisService;
