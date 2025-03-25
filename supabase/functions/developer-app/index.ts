
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createErrorResponse, createSuccessResponse, corsHeaders, checkRateLimit, getRateLimitHeaders, ErrorCodes } from '../_shared/apiHelpers.ts';

serve(async (req) => {
  console.log('Request to developer-app endpoint received:', req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
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

    switch (req.method) {
      case 'POST': {
        // Create a new developer app
        const requestBody = await req.json();
        const {
          app_name,
          description,
          website_url,
          callback_urls
        } = requestBody;
        
        // Validate required parameters
        if (!app_name || !callback_urls || !Array.isArray(callback_urls) || callback_urls.length === 0) {
          return new Response(
            JSON.stringify(createErrorResponse(
              'invalid_request', 
              'Missing required parameters: app_name and callback_urls array are required'
            )),
            {
              status: 400,
              headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
        
        // Validate callback URLs format
        const urlRegex = /^https?:\/\//i;
        const invalidUrls = callback_urls.filter(url => !urlRegex.test(url));
        
        if (invalidUrls.length > 0) {
          return new Response(
            JSON.stringify(createErrorResponse(
              'invalid_request', 
              `Invalid URL format: ${invalidUrls[0]}. URLs must start with http:// or https://`
            )),
            {
              status: 400,
              headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
        
        // Generate app ID and secret
        const appId = `app_${Date.now()}`;
        const appSecret = Array.from(crypto.getRandomValues(new Uint8Array(32)))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        
        // Save the application
        const { data, error } = await supabase
          .from('developer_apps')
          .insert({
            id: appId,
            user_id: user.id,
            app_name,
            description,
            website_url,
            callback_urls,
            app_secret: appSecret
          })
          .select()
          .single();
            
        if (error) {
          console.error('Error creating developer app:', error);
          return new Response(
            JSON.stringify(createErrorResponse(
              'server_error', 
              'Error creating developer app'
            )),
            {
              status: 500,
              headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
        
        // Return success response with the app credentials
        // Note: This is the only time we'll return the full app_secret
        return new Response(
          JSON.stringify(createSuccessResponse({
            id: data.id,
            app_name: data.app_name,
            app_secret: data.app_secret,
            created_at: data.created_at
          })),
          {
            status: 201,
            headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      case 'GET': {
        // Get all developer apps for the user
        const { data, error } = await supabase
          .from('developer_apps')
          .select('id, app_name, description, website_url, callback_urls, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching developer apps:', error);
          return new Response(
            JSON.stringify(createErrorResponse(
              'server_error', 
              'Error fetching developer apps'
            )),
            {
              status: 500,
              headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
        
        // Return success response with the apps
        return new Response(
          JSON.stringify(createSuccessResponse(data)),
          {
            status: 200,
            headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      default:
        return new Response(
          JSON.stringify(createErrorResponse('method_not_allowed', 'Method not allowed')),
          {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
    }
  } catch (error) {
    console.error('Error in developer-app endpoint:', error);
    
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
