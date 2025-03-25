
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createErrorResponse, createSuccessResponse, corsHeaders, checkRateLimit, getRateLimitHeaders, ErrorCodes } from '../_shared/apiHelpers.ts';

// Generate a secure random authorization code
function generateAuthorizationCode(length = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  console.log('Request to callback endpoint received:', req.url);
  
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
      user_id,
      app_id,
      app_name,
      redirect_uri,
      scope,
      state,
    } = requestBody;
    
    // Validate required parameters
    if (!user_id || !app_id || !redirect_uri || !scope) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'invalid_request', 
          'Missing required parameters: user_id, app_id, redirect_uri, and scope are required'
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
      .select('id, app_name, callback_urls')
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
    
    // Verify the redirect_uri is allowed for this app
    if (!appData.callback_urls.includes(redirect_uri)) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'invalid_redirect_uri', 
          'The provided redirect_uri is not authorized for this app'
        )),
        {
          status: 400,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Verify user_id exists
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user_id);
    
    if (userError || !userData.user) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'invalid_user', 
          'Invalid user_id'
        )),
        {
          status: 400,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Generate an authorization code
    const authorizationCode = generateAuthorizationCode();
    
    // Store the authorization code
    const { error: insertError } = await supabase
      .from('authorization_codes')
      .insert([
        {
          code: authorizationCode,
          user_id,
          app_id,
          redirect_uri,
          scope,
          state,
        }
      ]);
    
    if (insertError) {
      console.error('Error storing authorization code:', insertError);
      return new Response(
        JSON.stringify(createErrorResponse(
          'server_error', 
          'Error generating authorization code'
        )),
        {
          status: 500,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Build the redirect URL
    const redirectUrl = new URL(redirect_uri);
    redirectUrl.searchParams.append('code', authorizationCode);
    if (state) {
      redirectUrl.searchParams.append('state', state);
    }
    
    // Return the redirect URL
    const responseData = createSuccessResponse({
      redirect_url: redirectUrl.toString(),
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
    console.error('Error in callback endpoint:', error);
    
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
