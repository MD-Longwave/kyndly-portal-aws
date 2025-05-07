import { Request, Response } from 'express';
import logger from '../config/logger';
import openAIService from '../services/openai.service';

/**
 * Types for conversation history
 */
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Controller for AI-powered knowledge center
 */
const aiController = {
  /**
   * Send a user message to the AI and get a response
   * @param req - Express request with user message and optional conversation history
   * @param res - Express response
   */
  sendMessage: async (req: Request, res: Response): Promise<void> => {
    try {
      const { message, conversationHistory = [] } = req.body;

      // Validate request
      if (!message || typeof message !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Message is required and must be a string'
        });
        return;
      }

      // Validate conversation history format if provided
      if (conversationHistory && !Array.isArray(conversationHistory)) {
        res.status(400).json({
          success: false,
          message: 'Conversation history must be an array'
        });
        return;
      }

      // Get AI response
      const aiResponse = await openAIService.sendMessage(message, conversationHistory);

      // Return success response with AI message
      res.status(200).json({
        success: true,
        message: 'AI response generated successfully',
        data: {
          response: aiResponse,
          // Return the updated conversation history including this exchange
          conversationHistory: [
            ...conversationHistory,
            { role: 'user', content: message },
            { role: 'assistant', content: aiResponse }
          ]
        }
      });
    } catch (error: any) {
      logger.error('Error in AI chat controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate AI response',
        error: error.message
      });
    }
  },

  /**
   * Get ICHRA-specific information based on a query
   * @param req - Express request with query about ICHRA
   * @param res - Express response
   */
  getICHRAInfo: async (req: Request, res: Response): Promise<void> => {
    try {
      const { query } = req.body;

      // Validate request
      if (!query || typeof query !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Query is required and must be a string'
        });
        return;
      }

      // Get focused ICHRA information
      const ichraInfo = await openAIService.getICHRAInfo(query);

      // Return success response with ICHRA information
      res.status(200).json({
        success: true,
        message: 'ICHRA information retrieved successfully',
        data: {
          response: ichraInfo
        }
      });
    } catch (error: any) {
      logger.error('Error in AI ICHRA info controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve ICHRA information',
        error: error.message
      });
    }
  }
};

export default aiController; 