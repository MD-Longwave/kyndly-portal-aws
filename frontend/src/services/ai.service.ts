/**
 * AI Service for interacting with the Knowledge Center
 */

// API Gateway URL from environment variables or use current value as fallback
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://82ic0z3bab.execute-api.us-east-2.amazonaws.com/Prod';

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
      const authToken = await getAuthToken();
      
      // For debugging - log token info without revealing full token
      if (authToken) {
        console.log('Auth token obtained successfully', 
          authToken.substring(0, 10) + '...' + authToken.substring(authToken.length - 5));
      } else {
        console.log('Failed to get auth token');
      }

      // Log full URL for debugging
      const url = `${API_BASE_URL}/kyndly-ai-lambda/ai/chat`;
      console.log('Making API request to:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
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
      const authToken = await getAuthToken();

      // Log full URL for debugging
      const url = `${API_BASE_URL}/kyndly-ai-lambda/ai/ichra-info`;
      console.log('Making API request to:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
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

/**
 * Get the current authentication token from the Cognito session
 * @returns Promise with the bearer token string
 */
const getAuthToken = async (): Promise<string> => {
  try {
    // For AWS Amplify Auth
    // Import is here to avoid circular dependencies
    const { Auth } = await import('aws-amplify');
    
    try {
      const session = await Auth.currentSession();
      // You can use idToken or accessToken depending on your API Gateway setup
      return session.getIdToken().getJwtToken();
    } catch (error) {
      console.error('Error getting current session:', error);
      throw new Error('Not authenticated');
    }
  } catch (error) {
    console.error('Error importing Auth:', error);
    throw new Error('Authentication module not available');
  }
};

export default AIService;