/**
 * Route exports
 */
import { Router } from 'express';
import chatRoutes from './chatRoutes';

const router = Router();

// Mount routes
router.use('/api', chatRoutes);

export default router;
