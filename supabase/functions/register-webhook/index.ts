
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createErrorResponse, createSuccessResponse, corsHeaders, checkRateLimit, getRateLimitHeaders, ErrorCodes } from '../_shared/apiHelpers.ts';

serve(async (req) => {
  console.log('Request to register-webhook endpoint received:', req.url);
  
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
    const rateLimitResult = checkRateLimit(clientIp, 10, 60000); // 10 requests per minute
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

    // Get the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'unauthorized', 
          'Missing or invalid Authorization header'
        )),
        {
          status: 401,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Extract the token
    const token = authHeader.split(' ')[1];
    
    // Create Supabase client
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.33.1');
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verify the token and get the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'unauthorized', 
          'Invalid token'
        )),
        {
          status: 401,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Parse request body
    const requestBody = await req.json();
    const {
      app_id,
      url,
      events,
      description,
      secret
    } = requestBody;
    
    // Validate required parameters
    if (!app_id || !url || !events) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'invalid_request', 
          'Missing required parameters: app_id, url, and events are required'
        )),
        {
          status: 400,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'invalid_request', 
          'Invalid URL format'
        )),
        {
          status: 400,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Validate events format
    if (!Array.isArray(events) || events.length === 0) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'invalid_request', 
          'events must be a non-empty array'
        )),
        {
          status: 400,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Check valid event types
    const validEvents = [
      'address.verified',
      'address.updated',
      'permission.created',
      'permission.revoked',
      'address.accessed'
    ];
    
    const invalidEvents = events.filter(event => !validEvents.includes(event));
    if (invalidEvents.length > 0) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'invalid_request', 
          `Invalid event type(s): ${invalidEvents.join(', ')}. Valid events are: ${validEvents.join(', ')}`
        )),
        {
          status: 400,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Check if the app exists and belongs to the user
    const { data: appData, error: appError } = await supabase
      .from('developer_apps')
      .select('id')
      .eq('id', app_id)
      .eq('user_id', user.id)
      .single();
      
    if (appError || !appData) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'not_found', 
          'App not found or does not belong to the user'
        )),
        {
          status: 404,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Generate webhook ID and signature secret if not provided
    const webhookId = `wh_${Date.now()}`;
    const webhookSecret = secret || Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Register the webhook
    const { data: webhookData, error: webhookError } = await supabase
      .from('app_webhooks')
      .insert({
        id: webhookId,
        app_id,
        url,
        events,
        description: description || '',
        secret: webhookSecret,
        status: 'active',
        created_by: user.id
      })
      .select('id, url, events, description, status, created_at')
      .single();
      
    if (webhookError) {
      console.error('Error registering webhook:', webhookError);
      return new Response(
        JSON.stringify(createErrorResponse(
          'server_error', 
          'Error registering webhook'
        )),
        {
          status: 500,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Return success response with the webhook details and secret
    return new Response(
      JSON.stringify(createSuccessResponse({
        ...webhookData,
        webhook_secret: webhookSecret,
        message: 'Webhook registered successfully. Save this secret, it will not be shown again.'
      })),
      {
        status: 201,
        headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in register-webhook endpoint:', error);
    
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
