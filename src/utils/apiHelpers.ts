
/**
 * Standardized API response utilities
 */

// Standard API response structure
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    version: string;
    timestamp: string;
    requestId?: string;
  };
}

// Generate a successful API response
export function createSuccessResponse<T>(data: T, meta?: Partial<ApiResponse['meta']>): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      version: 'v1',
      timestamp: new Date().toISOString(),
      ...meta
    }
  };
}

// Generate an error API response
export function createErrorResponse(
  code: string,
  message: string,
  details?: any,
  meta?: Partial<ApiResponse['meta']>
): ApiResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details
    },
    meta: {
      version: 'v1',
      timestamp: new Date().toISOString(),
      ...meta
    }
  };
}

// Common error codes
export const ErrorCodes = {
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not_found',
  VALIDATION_ERROR: 'validation_error',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  INTERNAL_SERVER_ERROR: 'internal_server_error',
  TOKEN_EXPIRED: 'token_expired',
  INVALID_REQUEST: 'invalid_request',
  ADDRESS_NOT_VERIFIED: 'address_not_verified',
  PERMISSION_REVOKED: 'permission_revoked',
  MAX_ACCESS_EXCEEDED: 'max_access_exceeded'
};

// Generate a request ID for tracking
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// Simple rate limiting helper based on IP address
// Note: In production, use a more robust solution like Redis
const ipRequestCounts: Record<string, { count: number, resetTime: number }> = {};

export function checkRateLimit(
  ip: string, 
  maxRequests = 100, 
  windowMs = 60000
): { limited: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  
  // Initialize or reset if window expired
  if (!ipRequestCounts[ip] || ipRequestCounts[ip].resetTime < now) {
    ipRequestCounts[ip] = { 
      count: 0, 
      resetTime: now + windowMs 
    };
  }
  
  // Increment count
  ipRequestCounts[ip].count += 1;
  
  // Check if rate limited
  const isLimited = ipRequestCounts[ip].count > maxRequests;
  const remaining = Math.max(0, maxRequests - ipRequestCounts[ip].count);
  
  return { 
    limited: isLimited, 
    remaining, 
    resetTime: ipRequestCounts[ip].resetTime 
  };
}
