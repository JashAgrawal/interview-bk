import { Request, Response } from 'express';
import { chatService, embeddingService } from '../services';
import { getSessionId } from '../utils';
import { ChatResponse, ErrorResponse, SessionHistoryResponse, SessionResetResponse } from '../types';

/**
 * Handles a chat request
 * @param req Express request object
 * @param res Express response object
 */
export const handleChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.body;
    const sessionId = getSessionId(req);

    if (!query) {
      const errorResponse: ErrorResponse = { error: 'Query is required' };
      res.status(400).json(errorResponse);
      return;
    }

    // Process chat request
    const response = await chatService.processChat(sessionId, query);
    
    const chatResponse: ChatResponse = {
      sessionId,
      response,
      timestamp: new Date().toISOString()
    };
    
    res.json(chatResponse);
  } catch (error) {
    console.error('Error processing chat request:', error);
    const errorResponse: ErrorResponse = { error: 'Failed to process chat request' };
    res.status(500).json(errorResponse);
  }
};

/**
 * Handles a session history request
 * @param req Express request object
 * @param res Express response object
 */
export const handleSessionHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = getSessionId(req);
    
    // Get chat history for the session
    const history = await chatService.getChatHistory(sessionId);
    
    const historyResponse: SessionHistoryResponse = {
      sessionId,
      history,
      timestamp: new Date().toISOString()
    };
    
    res.json(historyResponse);
  } catch (error) {
    console.error('Error retrieving session history:', error);
    const errorResponse: ErrorResponse = { error: 'Failed to retrieve session history' };
    res.status(500).json(errorResponse);
  }
};

/**
 * Handles a session reset request
 * @param req Express request object
 * @param res Express response object
 */
export const handleSessionReset = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = getSessionId(req);
    
    // Clear chat history for the session
    await chatService.clearChatHistory(sessionId);
    
    const resetResponse: SessionResetResponse = {
      sessionId,
      message: 'Session reset successfully',
      timestamp: new Date().toISOString()
    };
    
    res.json(resetResponse);
  } catch (error) {
    console.error('Error resetting session:', error);
    const errorResponse: ErrorResponse = { error: 'Failed to reset session' };
    res.status(500).json(errorResponse);
  }
};

/**
 * Handles a refresh embeddings request
 * @param req Express request object
 * @param res Express response object
 */
export const handleRefreshEmbeddings = async (_req: Request, res: Response): Promise<void> => {
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
    const errorResponse: ErrorResponse = { error: 'Failed to refresh embeddings' };
    res.status(500).json(errorResponse);
  }
};
