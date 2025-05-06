import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import cognitoService from './cognitoService';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://irl951cfeb.execute-api.us-east-2.amazonaws.com/prod';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authorization token
api.interceptors.request.use(
  async (config) => {
    try {
      // Get the JWT token from Cognito
      const token = await cognitoService.getJwtToken();
      
      // If token exists, add it to the authorization header
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      
      return config;
    } catch (error) {
      console.error('Error adding auth token to request:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Attempt to refresh the token or redirect to login
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Define API service interface
interface ApiService {
  get: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>;
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>;
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>;
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>;
  delete: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>;
}

// Implement the API service
const apiService: ApiService = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.get<T>(url, config);
    return response.data;
  },
  
  post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.post<T>(url, data, config);
    return response.data;
  },
  
  put: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.put<T>(url, data, config);
    return response.data;
  },
  
  patch: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.patch<T>(url, data, config);
    return response.data;
  },
  
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.delete<T>(url, config);
    return response.data;
  }
};

export default apiService; 