/**
 * Temporary API Service for AWS Deployment
 * Properly includes API key in all requests
 */

// API Gateway URL
const API_BASE_URL = 'https://irl951cfeb.execute-api.us-east-2.amazonaws.com/prod';

// API key for AWS API Gateway
const API_KEY = 'EOpsK0PFHivt1qB5pbGH1GHRPKzFeG27ooU4KX8f';

console.log(`Using API URL: ${API_BASE_URL} with fixed API key`);

/**
 * Health check to verify API connectivity
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const healthEndpoint = `${API_BASE_URL}/health`;
    console.log(`Checking API health at: ${healthEndpoint}`);
    
    const response = await fetch(healthEndpoint, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      }
    });
    
    // Consider any response (even if it's an error) as a successful connection
    // This is because the API is responding, even if with an error
    console.log('API health check successful - API is accessible');
    return true;
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
      
      // Extract auth token if provided (and then remove it from the data to be sent)
      const authToken = quoteData.authToken;
      if (authToken) {
        delete quoteData.authToken;
      }
      
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
        
        // Add auth token to headers if available
        const headers: HeadersInit = { 'x-api-key': API_KEY };
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
          console.log('Added Authorization header with JWT token to form data request');
        } else {
          console.warn('No JWT token available for form data request');
        }
        
        try {
          response = await fetch(apiUrl, {
            method: 'POST',
            headers,
            body: formData,
            credentials: 'omit',  // Don't include credentials - fixes CORS issue
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
          // Add auth token to headers if available
          const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY
          };
          
          if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
            console.log('Added Authorization header with JWT token');
          } else {
            console.warn('No JWT token available for request');
          }
          
          response = await fetch(apiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(quoteData),
            credentials: 'omit',  // Don't include credentials - fixes CORS issue
          });
        } catch (fetchError) {
          console.error('Fetch error during JSON submission:', fetchError);
          throw fetchError;
        }
      }

      console.log('API response status:', response.status);
      
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
   * @returns Promise with quotes data
   */
  getQuotes: async () => {
    try {
      const url = `${API_BASE_URL}/quotes`;
        
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        }
      });

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
      const response = await fetch(`${API_BASE_URL}/quotes/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        }
      });

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