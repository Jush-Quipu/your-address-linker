
import { trackApiRequest } from '@/services/analyticsService';

/**
 * Middleware to track API requests and responses
 * @param endpoint The API endpoint being called
 * @param method The HTTP method
 * @param callback The actual API call function
 * @returns The response from the API call
 */
export const withApiTracking = async <T>(
  endpoint: string,
  method: string,
  callback: () => Promise<T>
): Promise<T> => {
  const startTime = performance.now();
  
  try {
    const response = await callback();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Get status code from response if available
    const status = 
      response && typeof response === 'object' && 'status' in response 
        ? (response as any).status 
        : 200;
    
    // Track the API request
    trackApiRequest(endpoint, method, status, duration);
    
    return response;
  } catch (error: any) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Track failed request
    trackApiRequest(
      endpoint, 
      method, 
      error.status || 500, 
      duration
    );
    
    throw error;
  }
};

/**
 * Creates a function that wraps API calls with tracking
 * @param baseEndpoint The base endpoint for the API
 * @returns A function that wraps API calls with tracking
 */
export const createApiTracker = (baseEndpoint: string) => {
  return <T>(
    endpoint: string,
    method: string,
    callback: () => Promise<T>
  ): Promise<T> => {
    const fullEndpoint = `${baseEndpoint}${endpoint}`;
    return withApiTracking(fullEndpoint, method, callback);
  };
};
