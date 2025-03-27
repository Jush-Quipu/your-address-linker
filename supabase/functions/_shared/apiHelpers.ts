
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.33.1';

// CORS headers for Edge Functions
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
};

// Error codes
export enum ErrorCodes {
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  NOT_FOUND = 'not_found',
  BAD_REQUEST = 'bad_request',
  RATE_LIMIT = 'rate_limit_exceeded',
  INTERNAL_ERROR = 'server_error',
  INVALID_TOKEN = 'invalid_token',
  INSUFFICIENT_SCOPES = 'insufficient_scopes'
}

// Create a consistent error response format
export const createErrorResponse = (
  code: string,
  message: string,
  details?: string | Record<string, any>
) => {
  return {
    error: {
      code,
      message,
      details: details || null,
      timestamp: new Date().toISOString()
    }
  };
};

// Create a consistent success response format
export const createSuccessResponse = (data: any) => {
  return {
    data,
    timestamp: new Date().toISOString()
  };
};

// Create a Supabase client
export const getSupabaseClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  return createClient(supabaseUrl, supabaseKey);
};

// In-memory rate limiting (warning: this is reset when the function restarts)
const rateLimits = new Map<string, { count: number, resetTime: number }>();

// Check rate limit for a given key (e.g., IP address)
export const checkRateLimit = (
  key: string,
  limit: number,
  windowMs: number
): { limited: boolean; remaining: number; resetTime: number } => {
  const now = Date.now();
  const record = rateLimits.get(key);
  
  // If no record exists or the window has expired, create a new one
  if (!record || now > record.resetTime) {
    const resetTime = now + windowMs;
    rateLimits.set(key, { count: 1, resetTime });
    return { limited: false, remaining: limit - 1, resetTime };
  }
  
  // Increment count
  record.count += 1;
  
  // Check if limit exceeded
  const limited = record.count > limit;
  const remaining = Math.max(0, limit - record.count);
  
  return { limited, remaining, resetTime: record.resetTime };
};

// Generate headers for rate limiting
export const getRateLimitHeaders = (
  limited: boolean,
  remaining: number,
  resetTime: number
) => {
  return {
    'X-RateLimit-Limit': 'true',
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
    ...(limited ? { 'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString() } : {})
  };
};

// Validate the OAuth token and get the user
export const validateToken = async (token: string) => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return { valid: false, user: null, error: 'Invalid token' };
    }
    
    return { valid: true, user: data.user, error: null };
  } catch (error) {
    console.error('Error validating token:', error);
    return { valid: false, user: null, error: error instanceof Error ? error.message : 'Error validating token' };
  }
};

// Log API usage for analytics
export const logApiUsage = async (
  supabase: any,
  appId: string,
  method: string,
  endpoint: string,
  userId: string | null,
  responseStatus: number,
  executionTimeMs: number,
  ipAddress?: string
) => {
  try {
    await supabase
      .from('developer_api_usage')
      .insert({
        app_id: appId,
        method,
        endpoint,
        user_id: userId,
        response_status: responseStatus,
        execution_time_ms: executionTimeMs,
        ip_address: ipAddress
      });
  } catch (error) {
    // Log but don't throw, as this is non-critical
    console.error('Error logging API usage:', error);
  }
};

// Rotate an app's secret
export const rotateAppSecret = async (
  supabase: any,
  appId: string,
  userId: string
) => {
  try {
    // Generate new app secret
    const newAppSecret = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Update app secret in database
    const { data, error } = await supabase
      .from('developer_apps')
      .update({ 
        app_secret: newAppSecret,
        updated_at: new Date().toISOString()
      })
      .eq('id', appId)
      .eq('user_id', userId)
      .select('app_secret')
      .single();
    
    if (error) throw error;
    
    return data.app_secret;
  } catch (error) {
    console.error('Error rotating app secret:', error);
    throw error;
  }
};

// Check developer app permissions
export const checkAppPermissions = async (
  supabase: any,
  appId: string,
  requiredScopes: string[] = []
) => {
  try {
    // Get app details
    const { data: app, error } = await supabase
      .from('developer_apps')
      .select('status, verification_status, oauth_settings, monthly_request_limit')
      .eq('id', appId)
      .single();
      
    if (error) {
      console.error('Error checking app permissions:', error);
      return {
        allowed: false,
        reason: 'App not found',
        details: error
      };
    }
    
    // Check app status
    if (app.status !== 'active' && app.status !== 'development') {
      return {
        allowed: false,
        reason: 'App is not active',
        details: { status: app.status }
      };
    }
    
    // Check verification status (only check if app is in active status, not development)
    if (app.status === 'active' && app.verification_status !== 'verified') {
      return {
        allowed: false,
        reason: 'App is not verified',
        details: { verification_status: app.verification_status }
      };
    }
    
    // Check scopes if required
    if (requiredScopes.length > 0) {
      const appScopes = app.oauth_settings?.scopes || [];
      
      // Check if the app has all required scopes
      const missingScopes = requiredScopes.filter(scope => !appScopes.includes(scope));
      
      if (missingScopes.length > 0) {
        return {
          allowed: false,
          reason: 'Insufficient scopes',
          details: { required: requiredScopes, missing: missingScopes }
        };
      }
    }
    
    // Check usage limits (if implemented)
    // This would query the developer_api_usage table to check against monthly_request_limit
    
    return {
      allowed: true,
      reason: null,
      details: {
        status: app.status,
        verification_status: app.verification_status
      }
    };
  } catch (error) {
    console.error('Error checking app permissions:', error);
    return {
      allowed: false,
      reason: 'Error checking permissions',
      details: error
    };
  }
};
