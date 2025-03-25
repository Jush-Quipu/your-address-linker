
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createErrorResponse, createSuccessResponse, corsHeaders, checkRateLimit, getRateLimitHeaders } from '../_shared/apiHelpers.ts';

// Constants for authorization
const REDIRECT_WHITELIST_REGEX = /^https?:\/\/([a-zA-Z0-9-]+\.)*([a-zA-Z0-9-]+\.[a-zA-Z0-9-]+)(:[0-9]+)?(\/.*)?$/;
const REQUIRED_PARAMS = ['app_id', 'redirect_uri', 'response_type', 'state'];
const VALID_RESPONSE_TYPES = ['code'];
const VALID_SCOPES = ['street', 'city', 'state', 'postal_code', 'country'];

serve(async (req) => {
  console.log('Request to authorize endpoint received:', req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
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
    const rateLimitResult = checkRateLimit(clientIp, 60, 60000); // 60 requests per minute
    const rateLimitHeaders = getRateLimitHeaders(
      rateLimitResult.limited, 
      rateLimitResult.remaining, 
      rateLimitResult.resetTime
    );
    
    // If rate limited, return 429 Too Many Requests
    if (rateLimitResult.limited) {
      return new Response(
        JSON.stringify(createErrorResponse('rate_limit_exceeded', 'Rate limit exceeded. Please try again later.')),
        {
          status: 429,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse URL to get query parameters
    const url = new URL(req.url);
    const queryParams = url.searchParams;
    
    // Check required parameters
    const missingParams = REQUIRED_PARAMS.filter(param => !queryParams.get(param));
    if (missingParams.length > 0) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'invalid_request', 
          `Missing required parameters: ${missingParams.join(', ')}`
        )),
        {
          status: 400,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Get and validate parameters
    const appId = queryParams.get('app_id')!;
    const redirectUri = queryParams.get('redirect_uri')!;
    const responseType = queryParams.get('response_type')!;
    const state = queryParams.get('state')!;
    const scope = queryParams.get('scope') || 'street,city,state,postal_code,country';
    const expiryDays = parseInt(queryParams.get('expiry_days') || '30');
    const maxAccessCount = queryParams.get('max_access_count') ? parseInt(queryParams.get('max_access_count')) : undefined;
    const accessNotification = queryParams.get('access_notification') === 'true';
    
    // Validate response type
    if (!VALID_RESPONSE_TYPES.includes(responseType)) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'unsupported_response_type', 
          `Unsupported response_type. Valid types: ${VALID_RESPONSE_TYPES.join(', ')}`
        )),
        {
          status: 400,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Validate redirect URI format
    if (!REDIRECT_WHITELIST_REGEX.test(redirectUri)) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'invalid_redirect_uri', 
          'Invalid redirect_uri format'
        )),
        {
          status: 400,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Validate scope
    const requestedScopes = scope.split(',').map(s => s.trim().toLowerCase());
    const invalidScopes = requestedScopes.filter(s => !VALID_SCOPES.includes(s));
    
    if (invalidScopes.length > 0) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'invalid_scope', 
          `Invalid scope values: ${invalidScopes.join(', ')}. Valid values: ${VALID_SCOPES.join(', ')}`
        )),
        {
          status: 400,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Validate expiry days
    if (isNaN(expiryDays) || expiryDays < 1 || expiryDays > 365) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'invalid_expiry', 
          'Invalid expiry_days. Must be between 1 and 365.'
        )),
        {
          status: 400,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Validate max access count if provided
    if (maxAccessCount !== undefined && (isNaN(maxAccessCount) || maxAccessCount < 1 || maxAccessCount > 1000)) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'invalid_max_access_count', 
          'Invalid max_access_count. Must be between 1 and 1000.'
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
    
    // Verify the redirect_uri is allowed for this app
    const { data: redirectData, error: redirectError } = await supabase
      .from('developer_apps')
      .select('callback_urls')
      .eq('id', appId)
      .single();
    
    if (redirectError || !redirectData || !redirectData.callback_urls.includes(redirectUri)) {
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
    
    // If everything is valid, redirect to the authorization page
    const authUrl = new URL('/authorize', 'https://akfieehzgpcapuhdujvf.supabase.co');
    authUrl.searchParams.append('app_id', appId);
    authUrl.searchParams.append('app_name', appData.app_name);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('scope', scope);
    authUrl.searchParams.append('expiry_days', expiryDays.toString());
    if (maxAccessCount !== undefined) {
      authUrl.searchParams.append('max_accesses', maxAccessCount.toString());
    }
    authUrl.searchParams.append('access_notification', accessNotification.toString());
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('response_type', responseType);
    
    // Return the authorization URL
    const responseData = createSuccessResponse({
      authorization_url: authUrl.toString(),
      scope: requestedScopes,
      state,
      expires_in: expiryDays * 86400, // days to seconds
    });
    
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { 
        ...corsHeaders, 
        ...rateLimitHeaders, 
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in authorize endpoint:', error);
    
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
