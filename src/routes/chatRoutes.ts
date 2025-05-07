import { Router } from 'express';
import { handleChat, handleSessionHistory, handleSessionReset, handleRefreshEmbeddings } from '../controllers';

const router = Router();

/**
 * @route POST /api/chat
 * @desc Process a chat request
 * @access Public
 */
router.post('/chat', handleChat);

/**
 * @route GET /api/session/history
 * @desc Get session chat history
 * @access Public
 */
router.get('/session/history', handleSessionHistory);

/**
 * @route POST /api/session/reset
 * @desc Reset session chat history
 * @access Public
 */
router.post('/session/reset', handleSessionReset);

/**
 * @route POST /api/refresh-embeddings
 * @desc Refresh embeddings
 * @access Public
 */
router.post('/refresh-embeddings', handleRefreshEmbeddings);

export default router;
