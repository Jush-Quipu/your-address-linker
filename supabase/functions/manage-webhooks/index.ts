import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createErrorResponse, createSuccessResponse, corsHeaders, checkRateLimit, getRateLimitHeaders } from '../_shared/apiHelpers.ts';

serve(async (req) => {
  console.log('Request to manage-webhooks endpoint received:', req.url);
  
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
    
    // Check rate limit - 30 requests per minute for webhook management
    const rateLimitResult = checkRateLimit(clientIp, 30, 60000);
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

    // Parse the URL to get the webhook ID if present
    const url = new URL(req.url);
    const path = url.pathname;
    const pathParts = url.pathname.split('/').filter(Boolean);
    const webhookId = pathParts.length > 1 ? pathParts[1] : null;
    const appIdParam = url.searchParams.get('app_id');
    
    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        // List webhooks (either all or filtered by app_id)
        // Or get a specific webhook if webhookId is provided
        if (webhookId) {
          // Get specific webhook
          const { data: webhook, error: getError } = await supabase
            .from('webhooks')
            .select(`
              id, 
              app_id, 
              url, 
              events, 
              is_active, 
              failure_count, 
              last_triggered_at, 
              created_at, 
              updated_at,
              metadata
            `)
            .eq('id', webhookId)
            .eq('user_id', user.id)
            .single();
            
          if (getError || !webhook) {
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
          
          return new Response(
            JSON.stringify(createSuccessResponse(webhook)),
            {
              status: 200,
              headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
            }
          );
        } else {
          // List webhooks with optional app_id filter
          let query = supabase
            .from('webhooks')
            .select(`
              id, 
              app_id, 
              url, 
              events, 
              is_active, 
              failure_count, 
              last_triggered_at, 
              created_at, 
              updated_at,
              metadata
            `)
            .eq('user_id', user.id);
            
          if (appIdParam) {
            query = query.eq('app_id', appIdParam);
          }
          
          const { data: webhooks, error: listError } = await query;
          
          if (listError) {
            console.error('Error listing webhooks:', listError);
            return new Response(
              JSON.stringify(createErrorResponse(
                'server_error', 
                'Error listing webhooks'
              )),
              {
                status: 500,
                headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
              }
            );
          }
          
          return new Response(
            JSON.stringify(createSuccessResponse({ webhooks })),
            {
              status: 200,
              headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
        
      case 'PATCH':
        // Update a webhook
        if (!webhookId) {
          return new Response(
            JSON.stringify(createErrorResponse(
              'invalid_request', 
              'Webhook ID is required for update'
            )),
            {
              status: 400,
              headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
        
        // Parse request body
        const updateBody = await req.json();
        const { url: newUrl, events: newEvents, is_active, description } = updateBody;
        
        // Validate input
        if (newUrl) {
          try {
            new URL(newUrl);
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
        }
        
        if (newEvents) {
          if (!Array.isArray(newEvents) || newEvents.length === 0) {
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
          
          const invalidEvents = newEvents.filter(event => !validEvents.includes(event));
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
        }
        
        // Check if webhook exists and belongs to user
        const { data: existingWebhook, error: checkError } = await supabase
          .from('webhooks')
          .select('id, metadata')
          .eq('id', webhookId)
          .eq('user_id', user.id)
          .single();
          
        if (checkError || !existingWebhook) {
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
        
        // Prepare updates
        const updates: Record<string, any> = {
          updated_at: new Date().toISOString()
        };
        
        if (newUrl !== undefined) updates.url = newUrl;
        if (newEvents !== undefined) updates.events = newEvents;
        if (is_active !== undefined) updates.is_active = is_active;
        
        // Handle metadata/description update
        if (description !== undefined) {
          const currentMetadata = existingWebhook.metadata || {};
          updates.metadata = {
            ...currentMetadata,
            description
          };
        }
        
        // Update the webhook
        const { data: updatedWebhook, error: updateError } = await supabase
          .from('webhooks')
          .update(updates)
          .eq('id', webhookId)
          .eq('user_id', user.id)
          .select()
          .single();
          
        if (updateError) {
          console.error('Error updating webhook:', updateError);
          return new Response(
            JSON.stringify(createErrorResponse(
              'server_error', 
              'Error updating webhook'
            )),
            {
              status: 500,
              headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
        
        return new Response(
          JSON.stringify(createSuccessResponse({
            webhook: updatedWebhook,
            message: 'Webhook updated successfully'
          })),
          {
            status: 200,
            headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
          }
        );
        
      case 'DELETE':
        // Delete a webhook
        if (!webhookId) {
          return new Response(
            JSON.stringify(createErrorResponse(
              'invalid_request', 
              'Webhook ID is required for deletion'
            )),
            {
              status: 400,
              headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
        
        // Check if webhook exists and belongs to user
        const { data: webhookToDelete, error: deleteCheckError } = await supabase
          .from('webhooks')
          .select('id, app_id')
          .eq('id', webhookId)
          .eq('user_id', user.id)
          .single();
          
        if (deleteCheckError || !webhookToDelete) {
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
        
        // Delete the webhook
        const { error: deleteError } = await supabase
          .from('webhooks')
          .delete()
          .eq('id', webhookId)
          .eq('user_id', user.id);
          
        if (deleteError) {
          console.error('Error deleting webhook:', deleteError);
          return new Response(
            JSON.stringify(createErrorResponse(
              'server_error', 
              'Error deleting webhook'
            )),
            {
              status: 500,
              headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
        
        // Log API usage for deletion
        const deleteApiUsagePromise = supabase
          .from('developer_api_usage')
          .insert({
            app_id: webhookToDelete.app_id,
            endpoint: 'manage-webhooks',
            method: 'DELETE',
            response_status: 200,
            user_id: user.id,
            ip_address: clientIp
          });
        
        // Don't await this to avoid slowing down the response
        deleteApiUsagePromise.then(result => {
          if (result.error) {
            console.error('Error logging API usage for webhook deletion:', result.error);
          }
        });
        
        return new Response(
          JSON.stringify(createSuccessResponse({
            message: 'Webhook deleted successfully'
          })),
          {
            status: 200,
            headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
          }
        );
        
      case 'test':
        // Test webhook delivery
        // Extract webhook ID from path
        const pathParts = path.split('/');
        const webhookId = pathParts[pathParts.length - 2];

        // Check if webhook exists and belongs to user
        const { data: webhook, error: webhookError } = await supabase
          .from('webhooks')
          .select('id, url, events, is_active, secret_key, app_id')
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
        
        if (!webhook.is_active) {
          return new Response(
            JSON.stringify(createErrorResponse(
              'webhook_disabled', 
              'Cannot test a disabled webhook'
            )),
            {
              status: 400,
              headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
        
        // Parse request body for custom event type and payload
        let eventType;
        let customPayload;
        
        if (req.method === 'POST') {
          try {
            const requestBody = await req.json();
            eventType = requestBody.event_type;
            customPayload = requestBody.custom_payload;
          } catch (e) {
            // If body parsing fails, continue with default event
            console.log('No custom event type or payload provided');
          }
        }
        
        // Use default event type if none specified or invalid
        if (!eventType || !webhook.events.includes(eventType)) {
          eventType = webhook.events[0] || 'test.event';
        }
        
        // Prepare test payload
        const timestamp = new Date().toISOString();
        const testPayload = customPayload || {
          event_type: eventType,
          test: true,
          app_id: webhook.app_id,
          timestamp
        };
        
        // Create webhook log entry
        const { data: webhookLog, error: logError } = await supabase
          .from('webhook_logs')
          .insert({
            webhook_id: webhookId,
            event_type: eventType,
            payload: testPayload,
            status: 'pending',
            attempt_count: 1
          })
          .select()
          .single();
          
        if (logError) {
          console.error('Error creating webhook log:', logError);
          return new Response(
            JSON.stringify(createErrorResponse(
              'server_error', 
              'Error creating webhook log'
            )),
            {
              status: 500,
              headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
        
        // Calculate signature if webhook has a secret key
        let signature = '';
        if (webhook.secret_key) {
          const encoder = new TextEncoder();
          const data = encoder.encode(JSON.stringify(testPayload) + webhook.secret_key);
          const hashBuffer = await crypto.subtle.digest('SHA-256', data);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }
        
        // Deliver the webhook in the background
        const deliverWebhook = async () => {
          try {
            const webhookResponse = await fetch(webhook.url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Webhook-Signature': signature,
                'X-Webhook-ID': webhookId,
                'X-Event-Type': eventType,
                'X-Delivery-ID': webhookLog.id
              },
              body: JSON.stringify(testPayload)
            });
            
            const responseStatus = webhookResponse.status;
            let responseBody;
            try {
              responseBody = await webhookResponse.text();
            } catch (e) {
              responseBody = 'Could not read response body';
            }
            
            // Update the webhook log
            await supabase
              .from('webhook_logs')
              .update({
                status: responseStatus >= 200 && responseStatus < 300 ? 'success' : 'failed',
                status_code: responseStatus,
                response_body: responseBody
              })
              .eq('id', webhookLog.id);
              
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
            
            // Update the webhook log with failure
            await supabase
              .from('webhook_logs')
              .update({
                status: 'failed',
                response_body: `Error: ${error.message || 'Unknown error'}`
              })
              .eq('id', webhookLog.id);
              
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
            message: 'Test webhook sent successfully',
            delivery_id: webhookLog.id,
            event_type: eventType
          })),
          {
            status: 202,
            headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
          }
        );
        
      default:
        return new Response(
          JSON.stringify(createErrorResponse('method_not_allowed', 'Method not allowed')),
          {
            status: 405,
            headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
          }
        );
    }
  } catch (error) {
    console.error('Error in manage-webhooks endpoint:', error);
    
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
