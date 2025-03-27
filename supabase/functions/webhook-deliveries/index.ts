
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createErrorResponse, createSuccessResponse, corsHeaders, checkRateLimit, getRateLimitHeaders } from '../_shared/apiHelpers.ts';

serve(async (req) => {
  console.log('Request to webhook-deliveries endpoint received:', req.url);
  
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
    const rateLimitResult = checkRateLimit(clientIp, 30, 60000); // 30 requests per minute
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

    // Parse URL to get webhook ID
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const webhookId = pathParts.length > 1 ? pathParts[1] : null;
    const isRetry = pathParts.length > 2 && pathParts[2] === 'retry';
    const deliveryId = isRetry && pathParts.length > 3 ? pathParts[3] : null;
    
    if (!webhookId) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'invalid_request', 
          'Webhook ID is required'
        )),
        {
          status: 400,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify webhook ownership
    const { data: webhook, error: webhookError } = await supabase
      .from('webhooks')
      .select('id, app_id')
      .eq('id', webhookId)
      .eq('user_id', user.id)
      .single();
      
    if (webhookError || !webhook) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'not_found', 
          'Webhook not found or does not belong to the user'
        )),
        {
          status: 404,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle different HTTP methods and paths
    if (req.method === 'GET') {
      // Get webhook delivery logs
      const { data: deliveries, error: deliveriesError } = await supabase
        .from('webhook_logs')
        .select('*')
        .eq('webhook_id', webhookId)
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (deliveriesError) {
        console.error('Error fetching webhook deliveries:', deliveriesError);
        return new Response(
          JSON.stringify(createErrorResponse(
            'server_error', 
            'Error fetching webhook deliveries'
          )),
          {
            status: 500,
            headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      return new Response(
        JSON.stringify(createSuccessResponse(deliveries)),
        {
          status: 200,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else if (req.method === 'POST' && isRetry && deliveryId) {
      // Retry a webhook delivery
      // First check if the delivery exists and belongs to the webhook
      const { data: delivery, error: deliveryError } = await supabase
        .from('webhook_logs')
        .select('id, webhook_id, event_type, payload, status')
        .eq('id', deliveryId)
        .eq('webhook_id', webhookId)
        .single();
        
      if (deliveryError || !delivery) {
        return new Response(
          JSON.stringify(createErrorResponse(
            'not_found', 
            'Delivery not found or does not belong to the webhook'
          )),
          {
            status: 404,
            headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      // Check if the webhook is active
      const { data: activeWebhook, error: activeError } = await supabase
        .from('webhooks')
        .select('is_active, url, secret_key')
        .eq('id', webhookId)
        .single();
        
      if (activeError || !activeWebhook) {
        return new Response(
          JSON.stringify(createErrorResponse(
            'server_error', 
            'Error checking webhook status'
          )),
          {
            status: 500,
            headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      if (!activeWebhook.is_active) {
        return new Response(
          JSON.stringify(createErrorResponse(
            'webhook_disabled', 
            'Cannot retry delivery for a disabled webhook'
          )),
          {
            status: 400,
            headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      // Create a new delivery log entry for the retry
      const timestamp = new Date().toISOString();
      const { data: retryLog, error: retryError } = await supabase
        .from('webhook_logs')
        .insert({
          webhook_id: webhookId,
          event_type: delivery.event_type,
          payload: delivery.payload,
          status: 'pending',
          attempt_count: 1
        })
        .select()
        .single();
        
      if (retryError) {
        console.error('Error creating retry log:', retryError);
        return new Response(
          JSON.stringify(createErrorResponse(
            'server_error', 
            'Error creating retry log'
          )),
          {
            status: 500,
            headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      // Prepare the payload
      const webhookPayload = {
        ...delivery.payload,
        retry_of: delivery.id,
        timestamp
      };
      
      // Calculate signature if webhook has a secret key
      let signature = '';
      if (activeWebhook.secret_key) {
        const encoder = new TextEncoder();
        const data = encoder.encode(JSON.stringify(webhookPayload) + activeWebhook.secret_key);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      }
      
      // Deliver the webhook in the background
      const deliverWebhook = async () => {
        try {
          const webhookResponse = await fetch(activeWebhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Signature': signature,
              'X-Webhook-ID': webhookId,
              'X-Event-Type': delivery.event_type,
              'X-Delivery-ID': retryLog.id
            },
            body: JSON.stringify(webhookPayload)
          });
          
          const responseStatus = webhookResponse.status;
          let responseBody;
          try {
            responseBody = await webhookResponse.text();
          } catch (e) {
            responseBody = 'Could not read response body';
          }
          
          // Update the retry log
          await supabase
            .from('webhook_logs')
            .update({
              status: responseStatus >= 200 && responseStatus < 300 ? 'success' : 'failed',
              status_code: responseStatus,
              response_body: responseBody
            })
            .eq('id', retryLog.id);
            
          // If successful, update the webhook last triggered timestamp
          if (responseStatus >= 200 && responseStatus < 300) {
            await supabase
              .from('webhooks')
              .update({
                last_triggered_at: timestamp
              })
              .eq('id', webhookId);
          } else {
            // If failed, increment the failure count
            await supabase
              .from('webhooks')
              .update({
                failure_count: supabase.rpc('increment', { x: 1 })
              })
              .eq('id', webhookId);
          }
        } catch (error) {
          console.error('Error delivering webhook:', error);
          
          // Update the retry log with failure
          await supabase
            .from('webhook_logs')
            .update({
              status: 'failed',
              response_body: `Error: ${error.message || 'Unknown error'}`
            })
            .eq('id', retryLog.id);
            
          // Increment the failure count
          await supabase
            .from('webhooks')
            .update({
              failure_count: supabase.rpc('increment', { x: 1 })
            })
            .eq('id', webhookId);
        }
      };
      
      // Start the delivery process in the background
      EdgeRuntime.waitUntil(deliverWebhook());
      
      return new Response(
        JSON.stringify(createSuccessResponse({
          message: 'Webhook delivery retry initiated',
          delivery_id: retryLog.id
        })),
        {
          status: 202,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      return new Response(
        JSON.stringify(createErrorResponse('method_not_allowed', 'Method not allowed')),
        {
          status: 405,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Error in webhook-deliveries endpoint:', error);
    
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
