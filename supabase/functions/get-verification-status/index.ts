
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
  
  // Apply rate limiting
  const clientIp = req.headers.get("x-forwarded-for") || "unknown";
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
    // Extract the user ID or address ID from the request
    const url = new URL(req.url);
    const userId = url.searchParams.get("user_id");
    const addressId = url.searchParams.get("address_id");
    const walletAddress = url.searchParams.get("wallet_address");
    const chainId = url.searchParams.get("chain_id");
    
    // We need at least one identifier
    if (!userId && !addressId && !walletAddress) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: "invalid_request",
          message: "Missing required parameter. Provide either user_id, address_id, or wallet_address.",
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
    
    // Handle wallet address lookup
    let targetUserId = userId;
    if (walletAddress && !userId) {
      const query = supabase
        .from("wallet_addresses")
        .select("user_id")
        .eq("address", walletAddress.toLowerCase());
        
      if (chainId) {
        query.eq("chain_id", parseInt(chainId));
      }
      
      const { data: walletData, error: walletError } = await query.maybeSingle();
      
      if (walletError || !walletData) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: "not_found",
            message: "Wallet address not found",
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
            status: 404,
            headers: responseHeaders
          }
        );
      }
      
      targetUserId = walletData.user_id;
    }

    // Query the database for verification status
    let query;
    if (addressId) {
      query = supabase
        .from("physical_addresses")
        .select(`
          id,
          verification_status,
          verification_method,
          verification_date,
          user_id,
          country,
          state,
          city,
          postal_code,
          postal_verified,
          postal_verification_date,
          created_at,
          updated_at
        `)
        .eq("id", addressId);
    } else if (targetUserId) {
      query = supabase
        .from("physical_addresses")
        .select(`
          id,
          verification_status,
          verification_method,
          verification_date,
          user_id,
          country,
          state,
          city,
          postal_code,
          postal_verified,
          postal_verification_date,
          created_at,
          updated_at
        `)
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false })
        .limit(1);
    }

    const { data: addressData, error: addressError } = await query.maybeSingle();

    if (addressError) {
      console.error("Database error:", addressError);
      const response: ApiResponse = {
        success: false,
        error: {
          code: "internal_server_error",
          message: "Error retrieving verification status",
          details: {
            message: addressError.message
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

    if (!addressData) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: "not_found",
          message: "No address found for the provided identifier",
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
          status: 404,
          headers: responseHeaders
        }
      );
    }

    // Get any linked wallets
    const { data: linkedWallets, error: walletsError } = await supabase
      .from("wallet_addresses")
      .select("address, chain_id, is_primary")
      .eq("user_id", addressData.user_id);
      
    if (walletsError) {
      console.error("Error fetching linked wallets:", walletsError);
    }
    
    // Get any ZKP verifications
    const { data: zkpVerifications, error: zkpError } = await supabase
      .from("zkp_verifications")
      .select("*")
      .eq("physical_address_id", addressData.id)
      .order("verified_at", { ascending: false });
      
    if (zkpError) {
      console.error("Error fetching ZKP verifications:", zkpError);
    }

    // Prepare the response
    const response: ApiResponse = {
      success: true,
      data: {
        id: addressData.id,
        user_id: addressData.user_id,
        verification: {
          status: addressData.verification_status,
          method: addressData.verification_method || null,
          date: addressData.verification_date || null,
          postal_verified: addressData.postal_verified || false,
          postal_verification_date: addressData.postal_verification_date || null,
        },
        location: {
          country: addressData.country,
          state: addressData.state,
          city: addressData.city,
          postal_code: addressData.postal_code,
        },
        timestamps: {
          created_at: addressData.created_at,
          updated_at: addressData.updated_at,
        },
        linked_wallets: linkedWallets || [],
        zkp_verifications: zkpVerifications || []
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
    console.error("Error processing request:", error, "Request ID:", requestId);
    
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
