import { Chat, GoogleGenAI } from "@google/genai";
import { config } from "../config";

/**
 * Type for chat history
 */
type ChatHistory = any; // Using any as a fallback since the exact type is not exported

/**
 * Interface for chat session configuration
 */
interface ChatSessionConfig {
  temperature: number;
  topP: number;
  topK: number;
  systemInstruction: string;
}

/**
 * GeminiService - A class-based service for interacting with Google's Gemini API
 *
 * This class provides a more efficient implementation by:
 * 1. Creating the GoogleGenAI client only once during initialization
 * 2. Supporting session-based chat instances for multiple users
 * 3. Providing methods for different types of interactions with Gemini
 * 4. Allowing for better configuration management
 */
export class GeminiService {
  private ai: GoogleGenAI;
  private chatSessions: Map<string, Chat> = new Map();
  private defaultConfig: ChatSessionConfig;

  /**
   * Creates a new instance of the GeminiService
   * @param apiKey Optional API key (defaults to the one in environment config)
   */
  constructor(apiKey: string = config.GEMINI_API_KEY) {
    this.ai = new GoogleGenAI({ apiKey });

    // Set default configuration
    this.defaultConfig = {
      temperature: 0.5,
      topP: 0.2,
      topK: 40,
      systemInstruction: "You are a helpful and informative chatbot that answers questions using text from the reference passage included below. Respond in a complete sentence and make sure that your response is easy to understand for everyone. Maintain a friendly and conversational tone. If the passage is irrelevant, feel free to ignore it."
    };
  }

  /**
   * Gets or creates a chat session for a specific session ID
   * @param sessionId The session ID
   * @param config Optional configuration parameters
   * @returns The chat session
   */
  private getOrCreateChatSession(
    sessionId: string,
    config: Partial<ChatSessionConfig> = {}
  ): Chat {
    // Check if session already exists
    if (this.chatSessions.has(sessionId)) {
      return this.chatSessions.get(sessionId)!;
    }

    // Merge default config with provided config
    const sessionConfig = {
      ...this.defaultConfig,
      ...config
    };

    // Create a new chat session
    const chat = this.ai.chats.create({
      model: "gemini-2.0-flash-001",
      history: [
        {
          role: "user",
          parts: [{ text: "Hello" }],
        },
        {
          role: "model",
          parts: [{ text: "Great to meet you. What would you like to know?" }],
        },
      ],
      config: {
        temperature: sessionConfig.temperature,
        topP: sessionConfig.topP,
        topK: sessionConfig.topK,
        systemInstruction: sessionConfig.systemInstruction,
      },
    });

    // Store the chat session
    this.chatSessions.set(sessionId, chat);

    return chat;
  }

  /**
   * Generates a response based on a query and relevant passage for a specific session
   * @param sessionId The session ID
   * @param query The user's query
   * @param relevant_passage The relevant passage to use for context
   * @param config Optional configuration parameters
   * @returns The generated response text
   */
  public async generateResponseWithPassage(
    sessionId: string,
    query: string,
    relevant_passage: string,
    config: Partial<ChatSessionConfig> = {}
  ): Promise<string> {
    // Get or create chat session
    const chat = this.getOrCreateChatSession(sessionId, config);

    const prompt = `
You are a helpful and informative chatbot that answers questions using text from the reference passage included below.
Respond in a complete sentence and make sure that your response is easy to understand for everyone.
Maintain a friendly and conversational tone. If the passage is irrelevant, feel free to ignore it.

QUESTION: '${query}'
PASSAGE: '${relevant_passage}'

ANSWER:`;

    const response = await chat.sendMessage({ message: prompt });

    return response.text || "I don't know how to answer that.";
  }

  /**
   * Resets a specific chat session
   * @param sessionId The session ID to reset
   * @param config Optional configuration parameters for the new session
   */
  public resetChatSession(
    sessionId: string,
    config: Partial<ChatSessionConfig> = {}
  ): void {
    // Remove existing session
    this.chatSessions.delete(sessionId);

    // Create a new session
    this.getOrCreateChatSession(sessionId, config);
  }

  /**
   * Gets a specific chat session
   * @param sessionId The session ID
   * @returns The chat session or null if not found
   */
  public getChatSession(sessionId: string): Chat | undefined {
    return this.chatSessions.get(sessionId);
  }

  /**
   * Gets all active session IDs
   * @returns Array of session IDs
   */
  public getActiveSessions(): string[] {
    return Array.from(this.chatSessions.keys());
  }

  /**
   * Checks if a session exists
   * @param sessionId The session ID to check
   * @returns True if the session exists, false otherwise
   */
  public hasSession(sessionId: string): boolean {
    return this.chatSessions.has(sessionId);
  }

  /**
   * Gets the chat history for a specific session
   * @param sessionId The session ID
   * @returns The chat history or null if session not found
   */
  public getChatHistory(sessionId: string): ChatHistory | null {
    const chat = this.chatSessions.get(sessionId);
    return chat ? chat.getHistory() : null;
  }
}
