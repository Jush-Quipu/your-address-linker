
// API Error Codes
export enum ErrorCodes {
  INVALID_REQUEST = 'invalid_request',
  INVALID_TOKEN = 'invalid_token',
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  NOT_FOUND = 'not_found',
  RATE_LIMIT = 'rate_limit',
  SERVER_ERROR = 'server_error',
}

// Standardized API Response format
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: ErrorCodes | string;
    message: string;
    details?: any;
  };
  meta?: {
    version: string;
    timestamp: string;
    requestId?: string;
  };
}

// Format API errors in a consistent way
export function formatApiError(error: any): ApiResponse {
  if (typeof error === 'string') {
    return {
      success: false,
      error: {
        code: ErrorCodes.SERVER_ERROR,
        message: error,
      },
      meta: {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      }
    };
  }
  
  if (error instanceof Error) {
    return {
      success: false,
      error: {
        code: ErrorCodes.SERVER_ERROR,
        message: error.message,
        details: error.stack,
      },
      meta: {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      }
    };
  }
  
  return {
    success: false,
    error: {
      code: ErrorCodes.SERVER_ERROR,
      message: 'Unknown error',
      details: error,
    },
    meta: {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    }
  };
}

// Check API health
export async function checkApiHealth(apiUrl: string): Promise<ApiResponse> {
  try {
    const response = await fetch(`${apiUrl}/health-check`, {
      headers: {
        'Content-Type': 'application/json',
        'X-App-ID': 'test-app-id',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    return formatApiError(error);
  }
}

// Test API connection for SDK
export async function testConnection(
  apiUrl: string = 'https://akfieehzgpcapuhdujvf.supabase.co/functions/v1',
  appId: string = 'test-app-id'
): Promise<ApiResponse> {
  try {
    console.log(`Testing connection to ${apiUrl}/health-check`);
    const response = await fetch(`${apiUrl}/health-check`, {
      headers: {
        'Content-Type': 'application/json',
        'X-App-ID': appId || 'test-app-id',
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      console.error(`API connection test failed with status: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API connection test successful:', data);
    return data;
  } catch (error) {
    console.error('API connection test error:', error);
    return formatApiError(error);
  }
}
