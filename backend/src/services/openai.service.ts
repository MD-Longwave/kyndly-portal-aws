import dotenv from 'dotenv';
import logger from '../config/logger';

// Load environment variables
dotenv.config();

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';

// System message to define the AI assistant's role and capabilities
const SYSTEM_MESSAGE = `
You are an expert AI assistant specializing in Individual Coverage Health Reimbursement Arrangements (ICHRA).
Your name is Kyndly Assistant, and you work for Kyndly Health, a company that helps employers implement ICHRA plans.

Key areas of your expertise include:
- ICHRA regulations and compliance requirements
- How ICHRAs compare to traditional group health insurance
- Implementation strategies for employers of different sizes
- Cost considerations and potential savings
- Employee education and onboarding
- Common questions and misconceptions about ICHRAs

When responding:
- Be accurate and up-to-date with health insurance regulations
- Provide practical, actionable information
- Explain complex topics in simple terms
- Focus on the benefits of ICHRAs while acknowledging limitations
- Reference specific regulations when relevant (ACA, IRS rules, etc.)
- When you don't know something, acknowledge it rather than providing incorrect information

Maintain a professional, helpful tone while making complex insurance concepts accessible.
`;

/**
 * Service for OpenAI API operations
 */
const openAIService = {
  /**
   * Send a message to OpenAI API and get a response
   * @param message - User message
   * @param conversationHistory - Previous messages in the conversation
   * @returns Promise with assistant's response
   */
  sendMessage: async (message: string, conversationHistory: any[] = []): Promise<string> => {
    try {
      if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key is not configured');
      }

      // Create messages array with system message, conversation history, and user message
      const messages = [
        { role: 'system', content: SYSTEM_MESSAGE },
        ...conversationHistory,
        { role: 'user', content: message }
      ];

      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          messages: messages,
          temperature: 0.7,
          max_tokens: 800,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        logger.error(`OpenAI API error: ${response.status} - ${errorData}`);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = data.choices[0].message.content;
      
      return assistantMessage;
    } catch (error: any) {
      logger.error('Error calling OpenAI API:', error);
      throw new Error(`Failed to get AI response: ${error.message}`);
    }
  },

  /**
   * Get relevant ICHRA information based on a specific query
   * @param query - Specific ICHRA-related query
   * @returns Promise with focused information about the query
   */
  getICHRAInfo: async (query: string): Promise<string> => {
    const specificPrompt = `
    The user wants to know about: ${query}
    
    Provide specific, accurate information about this ICHRA-related topic. Focus on practical information
    and include any relevant regulatory references if applicable.
    `;
    
    return openAIService.sendMessage(specificPrompt);
  }
};

export default openAIService; 