import { Request } from "express";
import { v4 as uuidv4 } from "uuid";

/**
 * Gets or creates a session ID from the request
 * @param req Express request object
 * @returns Session ID
 */
export const getSessionId = (req: Request): string => {
  // Check for session ID in headers
  let sessionId = req.headers["x-session-id"] as string;
  
  // If no session ID, generate a new one
  if (!sessionId) {
    sessionId = uuidv4();
  }
  
  return sessionId;
};
