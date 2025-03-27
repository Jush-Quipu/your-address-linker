
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.33.1';

// CORS headers for browser preflight requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create response helper functions
const createErrorResponse = (code: string, message: string, details?: any) => ({
  error: { code, message, details }
});

const createSuccessResponse = (data: any) => ({
  data
});

serve(async (req) => {
  console.log('Process webhook queue request received:', req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Only allow POST requests or scheduled invocations
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
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify(createErrorResponse('unauthorized', 'Missing or invalid Authorization header')),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Extract the token
    const token = authHeader.split(' ')[1];
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verify the token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      // Allow request to proceed if it's from Supabase's scheduled task system
      // Check if request is from cron job (would need additional verification in production)
      const isScheduledTask = req.headers.get('X-Scheduled-Function') === 'true';
      if (!isScheduledTask) {
        return new Response(
          JSON.stringify(createErrorResponse('unauthorized', 'Invalid token')),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }
    
    // Fetch pending webhook deliveries from the queue
    const { data: queueItems, error: queueError } = await supabase
      .from('webhook_retry_queue')
      .select('id, webhook_id, log_id, attempts, max_attempts, scheduled_at')
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(10);
      
    if (queueError) {
      throw queueError;
    }
    
    if (!queueItems || queueItems.length === 0) {
      return new Response(
        JSON.stringify(createSuccessResponse({ message: 'No pending webhook deliveries' })),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Process each webhook delivery
    const results = await Promise.all(queueItems.map(async (item) => {
      // Update queue item to processing
      await supabase
        .from('webhook_retry_queue')
        .update({ status: 'processing' })
        .eq('id', item.id);
        
      try {
        // Get webhook details
        const { data: webhook, error: webhookError } = await supabase
          .from('webhooks')
          .select('id, url, secret_key, is_active, user_id')
          .eq('id', item.webhook_id)
          .single();
          
        if (webhookError || !webhook || !webhook.is_active) {
          // Mark as failed if webhook doesn't exist or is inactive
          await supabase
            .from('webhook_retry_queue')
            .update({ 
              status: 'failed', 
              updated_at: new Date().toISOString() 
            })
            .eq('id', item.id);
            
          return {
            id: item.id,
            status: 'failed',
            reason: webhookError ? 'webhook_error' : webhook ? 'webhook_inactive' : 'webhook_not_found'
          };
        }
        
        // Get webhook log entry
        const { data: logEntry, error: logError } = await supabase
          .from('webhook_logs')
          .select('id, event_type, payload, attempt_count')
          .eq('id', item.log_id)
          .single();
          
        if (logError || !logEntry) {
          // Mark as failed if log entry doesn't exist
          await supabase
            .from('webhook_retry_queue')
            .update({ 
              status: 'failed', 
              updated_at: new Date().toISOString() 
            })
            .eq('id', item.id);
            
          return {
            id: item.id,
            status: 'failed',
            reason: 'log_not_found'
          };
        }
        
        // Prepare webhook payload
        const timestamp = new Date().toISOString();
        const payload = logEntry.payload;
        
        // Generate signature (HMAC)
        const payloadString = JSON.stringify(payload);
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
          'raw',
          encoder.encode(webhook.secret_key),
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        
        const signature = await crypto.subtle.sign(
          'HMAC',
          key,
          encoder.encode(`${timestamp}.${payloadString}`)
        );
        
        const signatureHex = Array.from(new Uint8Array(signature))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        
        // Send the webhook
        const webhookResponse = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signatureHex,
            'X-Webhook-Timestamp': timestamp,
            'X-Webhook-Event': logEntry.event_type,
            'User-Agent': 'SecureAddressBridge-Webhook/1.0'
          },
          body: payloadString
        });
        
        const responseText = await webhookResponse.text();
        const success = webhookResponse.status >= 200 && webhookResponse.status < 300;
        
        // Update webhook log with latest attempt
        await supabase
          .from('webhook_logs')
          .update({
            status: success ? 'success' : 'failed',
            status_code: webhookResponse.status,
            response_body: responseText.slice(0, 1000), // Limit response size
            attempt_count: logEntry.attempt_count + 1
          })
          .eq('id', item.log_id);
          
        // Update webhook with success/failure info
        if (success) {
          await supabase
            .from('webhooks')
            .update({
              last_triggered_at: new Date().toISOString(),
              failure_count: 0
            })
            .eq('id', webhook.id);
            
          // Mark queue item as completed
          await supabase
            .from('webhook_retry_queue')
            .update({ 
              status: 'completed', 
              updated_at: new Date().toISOString(),
              attempts: item.attempts + 1
            })
            .eq('id', item.id);
        } else {
          // Increment failure count for webhook
          await supabase
            .from('webhooks')
            .update({
              failure_count: supabase.rpc('increment', { value: 1 })
            })
            .eq('id', webhook.id);
          
          // If max attempts reached, mark as failed
          if (item.attempts + 1 >= item.max_attempts) {
            await supabase
              .from('webhook_retry_queue')
              .update({ 
                status: 'failed', 
                updated_at: new Date().toISOString(),
                attempts: item.attempts + 1
              })
              .eq('id', item.id);
          } else {
            // Schedule next retry with exponential backoff
            const backoffMinutes = Math.pow(2, item.attempts) * 5; // 5, 10, 20, 40, etc. minutes
            const nextAttempt = new Date();
            nextAttempt.setMinutes(nextAttempt.getMinutes() + backoffMinutes);
            
            await supabase
              .from('webhook_retry_queue')
              .update({ 
                status: 'pending', 
                updated_at: new Date().toISOString(),
                scheduled_at: nextAttempt.toISOString(),
                attempts: item.attempts + 1
              })
              .eq('id', item.id);
          }
        }
        
        return {
          id: item.id,
          status: success ? 'completed' : (item.attempts + 1 >= item.max_attempts ? 'failed' : 'rescheduled'),
          statusCode: webhookResponse.status
        };
      } catch (error) {
        console.error('Error processing webhook delivery:', error);
        
        // Mark as failed if there was an error
        await supabase
          .from('webhook_retry_queue')
          .update({ 
            status: 'failed', 
            updated_at: new Date().toISOString(),
            attempts: item.attempts + 1
          })
          .eq('id', item.id);
          
        return {
          id: item.id,
          status: 'failed',
          reason: 'exception',
          error: error.message
        };
      }
    }));
    
    return new Response(
      JSON.stringify(createSuccessResponse({ 
        processed: results.length,
        results
      })),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in webhook processor:', error);
    
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
