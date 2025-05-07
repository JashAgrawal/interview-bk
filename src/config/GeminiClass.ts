import { Chat, GoogleGenAI } from "@google/genai";
import { config } from "./env";

/**
 * GeminiService - A class-based service for interacting with Google's Gemini API
 *
 * This class provides a more efficient implementation by:
 * 1. Creating the GoogleGenAI client only once during initialization
 * 2. Providing methods for different types of interactions with Gemini
 * 3. Allowing for better configuration management
 */
export class GeminiService {
  private ai: GoogleGenAI;
  private chat: Chat | null = null;

  /**
   * Creates a new instance of the GeminiService
   * @param apiKey Optional API key (defaults to the one in environment config)
   */
  constructor(apiKey: string = config.GEMINI_API_KEY) {
    this.ai = new GoogleGenAI({ apiKey });
    this.initializeChat();
  }

  /**
   * Initializes a chat session with default configuration
   * @param temperature Optional temperature parameter (defaults to 0.5)
   * @param topP Optional topP parameter (defaults to 0.2)
   * @param topK Optional topK parameter (defaults to 40)
   */
  private initializeChat(
    temperature: number = 0.5,
    topP: number = 0.2,
    topK: number = 40
  ): void {
    this.chat = this.ai.chats.create({
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
        temperature,
        topP,
        topK,
        systemInstruction:
          "You are a helpful and informative chatbot that answers questions using text from the reference passage included below. Respond in a complete sentence and make sure that your response is easy to understand for everyone. Maintain a friendly and conversational tone. If the passage is irrelevant, feel free to ignore it.",
      },
    });
  }

  /**
   * Generates a response based on a query and relevant passage
   * @param query The user's query
   * @param relevant_passage The relevant passage to use for context
   * @returns The generated response text
   */
  public async generateResponseWithPassage(
    query: string,
    relevant_passage: string
  ): Promise<string> {
    if (!this.chat) {
      this.initializeChat();
    }

    const prompt = `
You are a helpful and informative chatbot that answers questions using text from the reference passage included below.
Respond in a complete sentence and make sure that your response is easy to understand for everyone.
Maintain a friendly and conversational tone. If the passage is irrelevant, feel free to ignore it.

QUESTION: '${query}'
PASSAGE: '${relevant_passage}'

ANSWER:`;

    const response = await this.chat!.sendMessage({ message: prompt });

    return response.text || "I don't know how to answer that.";
  }

  /**
   * Resets the chat session
   */
  public resetChat(): void {
    this.initializeChat();
  }

  /**
   * Gets the current chat session
   * @returns The current chat session
   */
  public getChat(): Chat | null {
    return this.chat;
  }
}

// Export a singleton instance for use throughout the application
export const geminiService = new GeminiService();

// Also export the class for cases where a new instance is needed
export default GeminiService;
