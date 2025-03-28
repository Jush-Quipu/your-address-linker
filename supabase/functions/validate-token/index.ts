
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Define CORS headers for browser compatibility
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-app-id, x-sdk-version, x-request-id",
  "Access-Control-Expose-Headers": "x-ratelimit-limit, x-ratelimit-remaining, x-ratelimit-reset",
};

// Interface for standardized API response
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta: {
    version: string;
    timestamp: string;
    requestId: string;
  };
}

// Create a Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Simple in-memory rate limiting (would use Redis in production)
const ipRequestCounts: Record<string, { count: number, resetTime: number }> = {};
const RATE_LIMIT = 120; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds

serve(async (req) => {
  const requestId = crypto.randomUUID();
  const requestStartTime = Date.now();
  
  // Generate response headers with request ID
  const responseHeaders = {
    ...corsHeaders,
    "Content-Type": "application/json",
    "X-Request-Id": requestId,
  };
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: responseHeaders });
  }
  
  // Get client IP for rate limiting
  const clientIp = req.headers.get("x-forwarded-for") || "unknown";
  
  // Apply rate limiting
  const now = Date.now();
  if (!ipRequestCounts[clientIp] || ipRequestCounts[clientIp].resetTime < now) {
    ipRequestCounts[clientIp] = { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
  }
  ipRequestCounts[clientIp].count++;
  
  // Add rate limit headers
  responseHeaders["X-RateLimit-Limit"] = RATE_LIMIT.toString();
  responseHeaders["X-RateLimit-Remaining"] = Math.max(0, RATE_LIMIT - ipRequestCounts[clientIp].count).toString();
  responseHeaders["X-RateLimit-Reset"] = Math.ceil((ipRequestCounts[clientIp].resetTime - now) / 1000).toString();
  
  // Check if rate limited
  if (ipRequestCounts[clientIp].count > RATE_LIMIT) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: "rate_limit_exceeded",
        message: "Rate limit exceeded. Please try again later.",
        details: {
          limit: RATE_LIMIT,
          remaining: 0,
          resetAt: new Date(ipRequestCounts[clientIp].resetTime).toISOString()
        }
      },
      meta: {
        version: "v1",
        timestamp: new Date().toISOString(),
        requestId
      }
    };
    
    return new Response(
      JSON.stringify(response),
      {
        status: 429,
        headers: responseHeaders
      }
    );
  }

  try {
    // Extract the access token from the request
    const authHeader = req.headers.get('authorization') || '';
    const accessToken = authHeader.replace('Bearer ', '');
    const appId = req.headers.get('x-app-id');
    const sdkVersion = req.headers.get('x-sdk-version');
    
    // Log the request for monitoring
    console.log(`Token validation request: App ID: ${appId || 'not provided'}, SDK Version: ${sdkVersion || 'not provided'}, Request ID: ${requestId}`);
    
    if (!accessToken) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: "invalid_request",
          message: "Missing access token",
        },
        meta: {
          version: "v1",
          timestamp: new Date().toISOString(),
          requestId
        }
      };
      
      return new Response(
        JSON.stringify(response),
        {
          status: 400,
          headers: responseHeaders
        }
      );
    }

    // Validate the token
    const { data: permission, error: permissionError } = await supabase
      .from("address_permissions")
      .select(`
        *,
        physical_addresses:physical_addresses!inner(verification_status)
      `)
      .eq("access_token", accessToken)
      .maybeSingle();

    if (permissionError || !permission) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: "unauthorized",
          message: "Invalid access token",
        },
        meta: {
          version: "v1",
          timestamp: new Date().toISOString(),
          requestId
        }
      };
      
      return new Response(
        JSON.stringify(response),
        {
          status: 401,
          headers: responseHeaders
        }
      );
    }

    // Check enhanced permission validity
    // 1. Check if revoked
    if (permission.revoked) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: "permission_revoked",
          message: "Token has been revoked",
          details: {
            reason: permission.revocation_reason || "Unknown reason"
          }
        },
        meta: {
          version: "v1",
          timestamp: new Date().toISOString(),
          requestId
        }
      };
      
      return new Response(
        JSON.stringify(response),
        {
          status: 401,
          headers: responseHeaders
        }
      );
    }

    // 2. Check if permission has expired
    if (permission.access_expiry && new Date(permission.access_expiry) < new Date()) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: "token_expired",
          message: "Token has expired",
          details: {
            expiredAt: permission.access_expiry
          }
        },
        meta: {
          version: "v1",
          timestamp: new Date().toISOString(),
          requestId
        }
      };
      
      return new Response(
        JSON.stringify(response),
        {
          status: 401,
          headers: responseHeaders
        }
      );
    }

    // 3. Check if max access count reached
    if (
      permission.max_access_count !== null && 
      permission.access_count >= permission.max_access_count
    ) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: "max_access_exceeded",
          message: "Maximum access count reached",
          details: {
            maxCount: permission.max_access_count,
            currentCount: permission.access_count
          }
        },
        meta: {
          version: "v1",
          timestamp: new Date().toISOString(),
          requestId
        }
      };
      
      return new Response(
        JSON.stringify(response),
        {
          status: 403,
          headers: responseHeaders
        }
      );
    }

    // Token is valid, increment access counter for analytics
    const { error: incrementError } = await supabase.rpc(
      "increment_counter",
      { row_id: permission.id }
    );

    if (incrementError) {
      console.error("Error incrementing counter:", incrementError);
    }

    // Update last accessed timestamp
    const { error: updateError } = await supabase
      .from("address_permissions")
      .update({ last_accessed: new Date().toISOString() })
      .eq("id", permission.id);

    if (updateError) {
      console.error("Error updating last accessed timestamp:", updateError);
    }

    // Get verification information for enhanced response
    const verificationStatus = permission.physical_addresses?.verification_status || 'unknown';

    // Token is valid
    const response: ApiResponse = {
      success: true,
      data: {
        app_id: permission.app_id,
        app_name: permission.app_name,
        access_count: permission.access_count + 1,
        max_access_count: permission.max_access_count,
        access_expiry: permission.access_expiry,
        verification: {
          status: verificationStatus
        },
        permissions: {
          share_street: permission.share_street,
          share_city: permission.share_city,
          share_state: permission.share_state,
          share_postal_code: permission.share_postal_code,
          share_country: permission.share_country
        },
        issuedAt: permission.created_at,
        lastAccessed: new Date().toISOString()
      },
      meta: {
        version: "v1",
        timestamp: new Date().toISOString(),
        requestId
      }
    };
    
    // Add server timing headers for performance monitoring
    responseHeaders["Server-Timing"] = `total;dur=${Date.now() - requestStartTime}`;
    
    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: responseHeaders
      }
    );
  } catch (error) {
    console.error("Error processing request:", error.message, "Request ID:", requestId);
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: "internal_server_error",
        message: "Internal server error",
        details: {
          message: error instanceof Error ? error.message : String(error)
        }
      },
      meta: {
        version: "v1",
        timestamp: new Date().toISOString(),
        requestId
      }
    };
    
    return new Response(
      JSON.stringify(response),
      {
        status: 500,
        headers: responseHeaders
      }
    );
  }
});
