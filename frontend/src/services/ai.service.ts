/**
 * AI Service for interacting with the Knowledge Center
 */

// API Gateway URL and key from the temp-api service
const API_BASE_URL = 'https://irl951cfeb.execute-api.us-east-2.amazonaws.com/prod';
const API_KEY = 'EOpsK0PFHivt1qB5pbGH1GHRPKzFeG27ooU4KX8f';

// Types for chat functionality
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  data: {
    response: string;
    conversationHistory: ChatMessage[];
  };
}

export interface ICHRAInfoResponse {
  success: boolean;
  message: string;
  data: {
    response: string;
  };
}

/**
 * AI Service for interacting with the Knowledge Center
 */
export const AIService = {
  /**
   * Send a message to the AI assistant
   * @param message - User's message
   * @param conversationHistory - Previous messages in the conversation
   * @returns Promise with AI response and updated conversation history
   */
  sendMessage: async (message: string, conversationHistory: ChatMessage[] = []): Promise<ChatResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify({
          message,
          conversationHistory
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error in AI service sendMessage:', error);
      throw error;
    }
  },

  /**
   * Get specific ICHRA information from the AI
   * @param query - Specific query about ICHRA
   * @returns Promise with ICHRA information
   */
  getICHRAInfo: async (query: string): Promise<ICHRAInfoResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/ichra-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error in AI service getICHRAInfo:', error);
      throw error;
    }
  }
};

export default AIService; 