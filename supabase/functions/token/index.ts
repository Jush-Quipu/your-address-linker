
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createErrorResponse, createSuccessResponse, corsHeaders, checkRateLimit, getRateLimitHeaders, ErrorCodes } from '../_shared/apiHelpers.ts';

// Generate a secure random token
function generateToken(length = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  console.log('Request to token endpoint received:', req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify(createErrorResponse('method_not_allowed', 'Method not allowed')),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Get client IP for rate limiting
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
    
    // Check rate limit
    const rateLimitResult = checkRateLimit(clientIp, 20, 60000); // 20 requests per minute for token endpoints
    const rateLimitHeaders = getRateLimitHeaders(
      rateLimitResult.limited, 
      rateLimitResult.remaining, 
      rateLimitResult.resetTime
    );
    
    // If rate limited, return 429 Too Many Requests
    if (rateLimitResult.limited) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'rate_limit_exceeded', 
          'Rate limit exceeded. Please try again later.'
        )),
        {
          status: 429,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const requestBody = await req.json();
    const {
      code,
      app_id: appId,
      redirect_uri: redirectUri,
      grant_type: grantType,
      refresh_token: refreshToken
    } = requestBody;
    
    // Validate grant type
    if (!grantType || !['authorization_code', 'refresh_token'].includes(grantType)) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'unsupported_grant_type', 
          'Unsupported grant_type. Valid types: authorization_code, refresh_token'
        )),
        {
          status: 400,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Create Supabase client
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.33.1');
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://akfieehzgpcapuhdujvf.supabase.co';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verify the app_id exists
    const { data: appData, error: appError } = await supabase
      .from('developer_apps')
      .select('id, app_name')
      .eq('id', appId)
      .single();
    
    if (appError || !appData) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'invalid_client', 
          'Invalid app_id'
        )),
        {
          status: 400,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle different grant types
    if (grantType === 'authorization_code') {
      // Validate required parameters for authorization_code grant
      if (!code || !redirectUri) {
        return new Response(
          JSON.stringify(createErrorResponse(
            'invalid_request', 
            'Missing required parameters: code and redirect_uri are required for authorization_code grant type'
          )),
          {
            status: 400,
            headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // TODO: In a real implementation, we would verify the code with the database
      // For now, we'll simulate a successful code exchange
      const accessToken = generateToken();
      const refreshToken = generateToken();
      const expiresIn = 3600; // 1 hour
      
      // Generate response
      const responseData = createSuccessResponse({
        access_token: accessToken,
        token_type: 'bearer',
        expires_in: expiresIn,
        refresh_token: refreshToken,
        scope: 'street,city,state,postal_code,country' // Default scope
      });
      
      return new Response(JSON.stringify(responseData), {
        status: 200,
        headers: { 
          ...corsHeaders, 
          ...rateLimitHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        },
      });
    } else if (grantType === 'refresh_token') {
      // Validate required parameters for refresh_token grant
      if (!refreshToken) {
        return new Response(
          JSON.stringify(createErrorResponse(
            'invalid_request', 
            'Missing required parameter: refresh_token is required for refresh_token grant type'
          )),
          {
            status: 400,
            headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // TODO: In a real implementation, we would verify the refresh token with the database
      // For now, we'll simulate a successful token refresh
      const newAccessToken = generateToken();
      const newRefreshToken = generateToken();
      const expiresIn = 3600; // 1 hour
      
      // Generate response
      const responseData = createSuccessResponse({
        access_token: newAccessToken,
        token_type: 'bearer',
        expires_in: expiresIn,
        refresh_token: newRefreshToken,
        scope: 'street,city,state,postal_code,country' // Default scope
      });
      
      return new Response(JSON.stringify(responseData), {
        status: 200,
        headers: { 
          ...corsHeaders, 
          ...rateLimitHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        },
      });
    }
    
    // This should never happen due to the validation above
    return new Response(
      JSON.stringify(createErrorResponse(
        'server_error', 
        'An unexpected error occurred'
      )),
      {
        status: 500,
        headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in token endpoint:', error);
    
    return new Response(
      JSON.stringify(createErrorResponse(
        'server_error', 
        'An error occurred while processing the request', 
        error instanceof Error ? error.message : String(error)
      )),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
