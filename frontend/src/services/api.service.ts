/**
 * API Service
 * Provides methods for interacting with the backend API
 */

// API base URL - this will be set to the correct domain in production
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

/**
 * Health check to verify API connectivity
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (response.ok) {
      console.log('API health check successful');
      return true;
    } else {
      console.error(`API health check failed with status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('API health check error:', error);
    return false;
  }
};

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
      console.log('Has files:', hasFiles);
      
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
                console.log(`Added file to form data: ${key}, name: ${quoteData[key].name}, size: ${quoteData[key].size} bytes`);
              }
            } else {
              formData.append(key, quoteData[key].toString());
              console.log(`Added to form data: ${key} = ${quoteData[key].toString().substring(0, 50)}${quoteData[key].toString().length > 50 ? '...' : ''}`);
            }
          }
        });
        
        console.log('Sending multipart form data request...');
        
        try {
          response = await fetch(apiUrl, {
            method: 'POST',
            body: formData,
            // Don't set Content-Type header, browser will set it with boundary
          });
        } catch (fetchError) {
          console.error('Fetch error during form data submission:', fetchError);
          throw fetchError;
        }
      } else {
        // Use JSON for non-file data
        console.log('Sending JSON request...');
        
        try {
          response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(quoteData),
          });
        } catch (fetchError) {
          console.error('Fetch error during JSON submission:', fetchError);
          throw fetchError;
        }
      }

      console.log('API response status:', response.status);
      
      // Log headers in a compatible way
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      console.log('API response headers:', headers);
      
      // Check if response has content
      const contentType = response.headers.get('content-type');
      let responseData;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          responseData = await response.json();
          console.log('API response data (JSON):', responseData);
        } catch (jsonError) {
          console.error('Error parsing JSON response:', jsonError);
          responseData = { error: 'Failed to parse JSON response' };
        }
      } else {
        try {
          responseData = await response.text();
          console.log('API response data (text):', responseData.substring(0, 200));
          if (responseData.length > 200) {
            console.log('... (truncated)');
          }
        } catch (textError) {
          console.error('Error reading response text:', textError);
          responseData = 'Failed to read response';
        }
      }

      if (!response.ok) {
        throw new Error(
          responseData?.message || 
          responseData?.error || 
          `API error: ${response.status} - ${response.statusText}`
        );
      }

      return responseData;
    } catch (error) {
      console.error('Error in QuoteService.submitQuote:', error);
      // Log the stack trace for more information
      if (error instanceof Error) {
        console.error('Error stack trace:', error.stack);
      }
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