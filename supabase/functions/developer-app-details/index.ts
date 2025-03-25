
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createErrorResponse, createSuccessResponse, corsHeaders, checkRateLimit, getRateLimitHeaders, ErrorCodes } from '../_shared/apiHelpers.ts';

serve(async (req) => {
  console.log('Request to developer-app-details endpoint received:', req.url);
  
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
    
    // Get app_id from URL
    const url = new URL(req.url);
    const appId = url.pathname.split('/').pop() || '';
    
    if (!appId) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'invalid_request', 
          'Missing app_id in URL'
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
      .select('*')
      .eq('id', appId)
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

    switch (req.method) {
      case 'GET': {
        // Return app details (excluding the full app_secret)
        const appResponse = {
          ...appData,
          app_secret: undefined // Don't send the full secret back
        };
        
        return new Response(
          JSON.stringify(createSuccessResponse(appResponse)),
          {
            status: 200,
            headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      case 'PATCH': {
        // Update app details
        const requestBody = await req.json();
        const {
          app_name,
          description,
          website_url,
          callback_urls
        } = requestBody;
        
        // Build update object with only provided fields
        const updates: Record<string, any> = {};
        
        if (app_name !== undefined) updates.app_name = app_name;
        if (description !== undefined) updates.description = description;
        if (website_url !== undefined) updates.website_url = website_url;
        if (callback_urls !== undefined) {
          // Validate callback URLs format if provided
          if (!Array.isArray(callback_urls) || callback_urls.length === 0) {
            return new Response(
              JSON.stringify(createErrorResponse(
                'invalid_request', 
                'callback_urls must be a non-empty array'
              )),
              {
                status: 400,
                headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
              }
            );
          }
          
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
          
          updates.callback_urls = callback_urls;
        }
        
        // If no updates provided
        if (Object.keys(updates).length === 0) {
          return new Response(
            JSON.stringify(createErrorResponse(
              'invalid_request', 
              'No valid fields to update'
            )),
            {
              status: 400,
              headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
        
        // Update the app
        const { data: updatedData, error: updateError } = await supabase
          .from('developer_apps')
          .update(updates)
          .eq('id', appId)
          .eq('user_id', user.id)
          .select('id, app_name, description, website_url, callback_urls, created_at')
          .single();
          
        if (updateError) {
          console.error('Error updating developer app:', updateError);
          return new Response(
            JSON.stringify(createErrorResponse(
              'server_error', 
              'Error updating developer app'
            )),
            {
              status: 500,
              headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
        
        return new Response(
          JSON.stringify(createSuccessResponse(updatedData)),
          {
            status: 200,
            headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      case 'DELETE': {
        // Delete the app
        const { error: deleteError } = await supabase
          .from('developer_apps')
          .delete()
          .eq('id', appId)
          .eq('user_id', user.id);
          
        if (deleteError) {
          console.error('Error deleting developer app:', deleteError);
          return new Response(
            JSON.stringify(createErrorResponse(
              'server_error', 
              'Error deleting developer app'
            )),
            {
              status: 500,
              headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
        
        return new Response(
          JSON.stringify(createSuccessResponse({ deleted: true })),
          {
            status: 200,
            headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      case 'POST': {
        // Handle app secret rotation
        const { data: newSecretData, error: newSecretError } = await supabase.rpc(
          'rotate_app_secret',
          { app_id: appId, user_id: user.id }
        );
        
        if (newSecretError || !newSecretData) {
          console.error('Error rotating app secret:', newSecretError);
          return new Response(
            JSON.stringify(createErrorResponse(
              'server_error', 
              'Error rotating app secret'
            )),
            {
              status: 500,
              headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
        
        return new Response(
          JSON.stringify(createSuccessResponse({ 
            new_secret: newSecretData,
            message: 'App secret rotated successfully. Save this secret, it will not be shown again.'
          })),
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
    console.error('Error in developer-app-details endpoint:', error);
    
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
