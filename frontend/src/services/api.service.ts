/**
 * API Service - Updated with API key and Auth token for authenticated requests
 * Provides methods for interacting with the backend API
 */

import { Auth } from 'aws-amplify';

// Use AWS API Gateway URL and API key for the API in production
// For local development, use a relative path that will be proxied
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://irl951cfeb.execute-api.us-east-2.amazonaws.com/prod'
  : '/api';

// Cache-busting version
const API_VERSION = 'v1.0.1';

// API key for AWS API Gateway (from environment variable or hardcoded for testing)
const API_KEY = process.env.REACT_APP_API_KEY || 'EOpsK0PFHivt1qB5pbGH1GHRPKzFeG27ooU4KX8f';

console.log(`Using API URL: ${API_BASE_URL} in ${process.env.NODE_ENV || 'development'} mode with version ${API_VERSION}`);

/**
 * Get the current user's ID token from Cognito
 * @returns Promise with the ID token or null
 */
const getAuthToken = async (): Promise<string | null> => {
  try {
    console.log('Retrieving auth token from Cognito...');
    const session = await Auth.currentSession();
    const token = session.getIdToken().getJwtToken();
    const tokenFirstPart = token.substring(0, 20) + '...';
    console.log(`Auth token retrieved successfully: ${tokenFirstPart} (Length: ${token.length})`);
    
    try {
      // Get user info for debugging
      const user = await Auth.currentAuthenticatedUser();
      console.log('Current authenticated user:', user.username);
      console.log('User attributes:', user.attributes);
    } catch (userError) {
      console.warn('Error fetching user details:', userError);
    }
    
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Add API key and Auth token to request headers
 */
const getApiHeaders = async (contentType = 'application/json'): Promise<HeadersInit> => {
  const headers: HeadersInit = {
    'Content-Type': contentType,
  };
  
  // Add API key if in production
  if (process.env.NODE_ENV === 'production' && API_KEY) {
    headers['x-api-key'] = API_KEY;
  }
  
  // Add Authorization header with JWT token if available
  const token = await getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('Added Authorization header with JWT token');
  } else {
    console.warn('No JWT token available for request');
  }
  
  return headers;
};

/**
 * Health check to verify API connectivity
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const healthEndpoint = `${API_BASE_URL}/health`;
    console.log(`Checking API health at: ${healthEndpoint}`);
    
    // Health endpoint usually doesn't require authentication
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
      
      // IMPORTANT: Ensure we have the auth token before proceeding with any API calls
      // This ensures the token is fully retrieved before any API calls are made
      let authToken = quoteData.authToken;
      if (!authToken) {
        console.log('No token provided in quoteData, retrieving from Cognito...');
        try {
          const session = await Auth.currentSession();
          authToken = session.getIdToken().getJwtToken();
          console.log('Successfully retrieved auth token at the beginning of submitQuote');
          
          // Store it back in quoteData for later use
          quoteData.authToken = authToken;
        } catch (tokenError) {
          console.error('Failed to get token at the beginning of submitQuote:', tokenError);
          throw new Error('Authentication required. Please sign in again.');
        }
      }
      
      const apiUrl = `${API_BASE_URL}/quotes`;
      console.log('Using API endpoint:', apiUrl);
      
      // Extract auth token from the data to be sent
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
        
        // For form data requests, create headers with auth token
        const headers: HeadersInit = { 
          'x-api-key': API_KEY 
        };
        
        // Use the provided token if available, otherwise try to get it
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
          console.log('Added Authorization header with provided JWT token to form data request');
        } else {
          const token = await getAuthToken();
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
            console.log('Added Authorization header with retrieved JWT token to form data request');
          } else {
            console.warn('No JWT token available for form data request');
          }
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
          let headers: HeadersInit;
          // Use the provided token if available, otherwise try to get it via getApiHeaders
          if (authToken) {
            headers = {
              'Content-Type': 'application/json',
              'x-api-key': API_KEY,
              'Authorization': `Bearer ${authToken}`
            };
            console.log('Added Authorization header with provided JWT token');
          } else {
            headers = await getApiHeaders();
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
        
      const headers = await getApiHeaders();
      const response = await fetch(url, { headers });

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
      const headers = await getApiHeaders();
      const response = await fetch(`${API_BASE_URL}/quotes/${id}`, { headers });

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