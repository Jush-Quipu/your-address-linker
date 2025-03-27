
// API utility functions for making API requests to the backend

import { toast } from "sonner";

/**
 * Tests the connection to the API
 * @param baseUrl - The base URL of the API
 * @param apiKey - The API key to use for authentication
 * @returns A response object indicating success or failure
 */
export const testConnection = async (baseUrl: string, apiKey: string) => {
  try {
    const response = await fetch(`${baseUrl}/health-check`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: {
          status: response.status,
          message: errorData.message || 'API connection failed'
        }
      };
    }
    
    const data = await response.json();
    return {
      success: true,
      meta: {
        version: data.version || '1.0.0',
        serverTime: data.serverTime
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.message || 'Network error occurred'
      }
    };
  }
};

/**
 * Makes an authenticated API request
 * @param url - The URL to make the request to
 * @param method - The HTTP method to use
 * @param apiKey - The API key to use for authentication
 * @param body - The request body (optional)
 * @returns The response data or an error
 */
export const makeApiRequest = async (
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  apiKey: string,
  body?: any
) => {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };
    
    const requestOptions: RequestInit = {
      method,
      headers
    };
    
    if (body && (method === 'POST' || method === 'PUT')) {
      requestOptions.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: {
          status: response.status,
          message: errorData.message || `API request failed with status ${response.status}`
        }
      };
    }
    
    const data = await response.json();
    return {
      success: true,
      data
    };
  } catch (error: any) {
    toast.error('API request failed', {
      description: error.message || 'Network error occurred'
    });
    
    return {
      success: false,
      error: {
        message: error.message || 'Network error occurred'
      }
    };
  }
};
