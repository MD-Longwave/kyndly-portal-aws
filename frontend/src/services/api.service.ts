/**
 * API Service
 * Provides methods for interacting with the backend API
 */

// API base URL - this will be set to the correct domain in production
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

/**
 * Quote API Service
 */
export const QuoteService = {
  /**
   * Submit a new quote
   * @param quoteData - Quote data to submit
   * @returns Promise with response data
   */
  submitQuote: async (quoteData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/quotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting quote:', error);
      throw error;
    }
  },

  /**
   * Get quotes list
   * @param tpaId - Optional TPA ID to filter by
   * @returns Promise with quotes data
   */
  getQuotes: async (tpaId?: string) => {
    try {
      const url = tpaId 
        ? `${API_BASE_URL}/quotes?tpaId=${encodeURIComponent(tpaId)}` 
        : `${API_BASE_URL}/quotes`;
        
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching quotes:', error);
      throw error;
    }
  },

  /**
   * Get a quote by ID
   * @param id - Quote ID
   * @returns Promise with quote data
   */
  getQuoteById: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/quotes/${id}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching quote ${id}:`, error);
      throw error;
    }
  }
};

export default {
  Quote: QuoteService,
}; 