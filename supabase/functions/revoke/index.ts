
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createErrorResponse, createSuccessResponse, corsHeaders, checkRateLimit, getRateLimitHeaders, ErrorCodes } from '../_shared/apiHelpers.ts';

serve(async (req) => {
  console.log('Request to revoke endpoint received:', req.url);
  
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
    const rateLimitResult = checkRateLimit(clientIp, 20, 60000); // 20 requests per minute
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
      token,
      token_type_hint,
      app_id,
    } = requestBody;
    
    // Validate required parameters
    if (!token || !app_id) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'invalid_request', 
          'Missing required parameters: token and app_id are required'
        )),
        {
          status: 400,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Default token type hint to 'access_token' if not provided
    const tokenTypeHint = token_type_hint || 'access_token';
    
    // Validate token type hint
    if (tokenTypeHint !== 'access_token' && tokenTypeHint !== 'refresh_token') {
      return new Response(
        JSON.stringify(createErrorResponse(
          'invalid_request', 
          'Invalid token_type_hint. Valid values: access_token, refresh_token'
        )),
        {
          status: 400,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Create Supabase client
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.33.1');
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verify the app_id exists
    const { data: appData, error: appError } = await supabase
      .from('developer_apps')
      .select('id')
      .eq('id', app_id)
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
    
    // Check if the token exists
    let tokenData;
    let tokenError;
    
    if (tokenTypeHint === 'access_token') {
      const result = await supabase
        .from('access_tokens')
        .select('*')
        .eq('token', token)
        .eq('app_id', app_id)
        .eq('revoked', false)
        .single();
      
      tokenData = result.data;
      tokenError = result.error;
    } else { // refresh_token
      const result = await supabase
        .from('access_tokens')
        .select('*')
        .eq('refresh_token', token)
        .eq('app_id', app_id)
        .eq('revoked', false)
        .single();
      
      tokenData = result.data;
      tokenError = result.error;
    }
    
    // If token doesn't exist or is already revoked, return success (idempotent)
    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify(createSuccessResponse({
          revoked: true
        })),
        {
          status: 200,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Revoke the token
    const { error: revokeError } = await supabase
      .from('access_tokens')
      .update({
        revoked: true,
        revoked_at: new Date().toISOString()
      })
      .eq('id', tokenData.id);
    
    if (revokeError) {
      console.error('Error revoking token:', revokeError);
      return new Response(
        JSON.stringify(createErrorResponse(
          'server_error', 
          'Error revoking token'
        )),
        {
          status: 500,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Return success response
    const responseData = createSuccessResponse({
      revoked: true
    });
    
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { 
        ...corsHeaders, 
        ...rateLimitHeaders, 
        'Content-Type': 'application/json' 
      },
    });
  } catch (error) {
    console.error('Error in revoke endpoint:', error);
    
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
