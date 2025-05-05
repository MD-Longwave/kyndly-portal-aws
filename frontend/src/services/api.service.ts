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
      console.log('QuoteService.submitQuote called with data:', quoteData);
      
      const apiUrl = `${API_BASE_URL}/quotes`;
      console.log('Using API endpoint:', apiUrl);
      
      // Check if we need to use form data (for file uploads)
      const hasFiles = quoteData.censusFile || quoteData.planComparisonFile;
      
      let response;
      
      if (hasFiles) {
        // Use FormData for file uploads
        const formData = new FormData();
        
        // Add all data to FormData
        Object.keys(quoteData).forEach(key => {
          // Skip null/undefined values
          if (quoteData[key] !== null && quoteData[key] !== undefined) {
            if (key === 'censusFile' || key === 'planComparisonFile') {
              // Only add actual File objects
              if (quoteData[key] instanceof File) {
                formData.append(key, quoteData[key]);
              }
            } else {
              formData.append(key, quoteData[key].toString());
            }
          }
        });
        
        response = await fetch(apiUrl, {
          method: 'POST',
          body: formData,
          // Don't set Content-Type header, browser will set it with boundary
        });
      } else {
        // Use JSON for non-file data
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(quoteData),
        });
      }

      console.log('API response status:', response.status);
      
      // Check if response has content
      const contentType = response.headers.get('content-type');
      let responseData;
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }
      
      console.log('API response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData?.message || `API error: ${response.status}`);
      }

      return responseData;
    } catch (error) {
      console.error('Error in QuoteService.submitQuote:', error);
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