/**
 * Common types used throughout the application
 */

/**
 * Chat message interface
 */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

/**
 * RSS feed item interface
 */
export interface FeedItem {
  title: string;
  link: string;
  content: string;
  contentSnippet: string;
  guid: string;
  isoDate: string;
}

/**
 * Processed feed data for embedding
 */
export interface ProcessedFeed {
  docs: string[];
  metadatas: Record<string, string>[];
  ids: string[];
}

/**
 * Chat response interface
 */
export interface ChatResponse {
  sessionId: string;
  response: string;
  timestamp: string;
}

/**
 * Session history response interface
 */
export interface SessionHistoryResponse {
  sessionId: string;
  history: ChatMessage[];
  timestamp: string;
}

/**
 * Session reset response interface
 */
export interface SessionResetResponse {
  sessionId: string;
  message: string;
  timestamp: string;
}

/**
 * Error response interface
 */
export interface ErrorResponse {
  error: string;
}
