import express from 'express';
import aiController from '../controllers/ai.controller';
import authMiddleware from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @route   POST /api/ai/chat
 * @desc    Send a message to the AI assistant and get a response
 * @access  Private (requires authentication)
 */
router.post('/chat', authMiddleware.authenticate, aiController.sendMessage);

/**
 * @route   POST /api/ai/ichra-info
 * @desc    Get specific ICHRA information from the AI
 * @access  Private (requires authentication)
 */
router.post('/ichra-info', authMiddleware.authenticate, aiController.getICHRAInfo);

export default router; 