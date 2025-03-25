
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createErrorResponse, createSuccessResponse, corsHeaders, checkRateLimit, getRateLimitHeaders, ErrorCodes } from '../_shared/apiHelpers.ts';

serve(async (req) => {
  console.log('Request to address endpoint received:', req.url);
  
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

    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify(createErrorResponse(
          ErrorCodes.UNAUTHORIZED, 
          'Missing or invalid Authorization header'
        )),
        {
          status: 401,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    // Get App ID from headers
    const appId = req.headers.get('x-app-id');
    if (!appId) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'invalid_request', 
          'Missing X-App-ID header'
        )),
        {
          status: 400,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Parse URL to get query parameters
    const url = new URL(req.url);
    const queryParams = url.searchParams;
    const fields = queryParams.get('fields')?.split(',') || ['street', 'city', 'state', 'postal_code', 'country'];
    const includeVerification = queryParams.get('include_verification') === 'true';
    
    // Create Supabase client
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.33.1');
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://akfieehzgpcapuhdujvf.supabase.co';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Validate token and get permission
    const { data: permissionData, error: permissionError } = await supabase
      .from('address_permissions')
      .select('*')
      .eq('access_token', token)
      .eq('app_id', appId)
      .eq('revoked', false)
      .single();
    
    if (permissionError || !permissionData) {
      return new Response(
        JSON.stringify(createErrorResponse(
          ErrorCodes.UNAUTHORIZED, 
          'Invalid or expired token'
        )),
        {
          status: 401,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Check if permission is expired
    if (permissionData.access_expiry && new Date(permissionData.access_expiry) < new Date()) {
      return new Response(
        JSON.stringify(createErrorResponse(
          ErrorCodes.TOKEN_EXPIRED, 
          'Token has expired'
        )),
        {
          status: 401,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Check if max access count is reached
    if (
      permissionData.max_access_count !== null && 
      permissionData.access_count >= permissionData.max_access_count
    ) {
      return new Response(
        JSON.stringify(createErrorResponse(
          ErrorCodes.MAX_ACCESS_EXCEEDED, 
          'Maximum access count exceeded'
        )),
        {
          status: 403,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Get user's physical address
    const { data: addressData, error: addressError } = await supabase
      .from('physical_addresses')
      .select('*')
      .eq('user_id', permissionData.user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (addressError || !addressData) {
      return new Response(
        JSON.stringify(createErrorResponse(
          ErrorCodes.NOT_FOUND, 
          'No address found for this user'
        )),
        {
          status: 404,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Check if address is verified if needed
    if (addressData.verification_status !== 'verified') {
      return new Response(
        JSON.stringify(createErrorResponse(
          ErrorCodes.ADDRESS_NOT_VERIFIED, 
          'Address has not been verified'
        )),
        {
          status: 403,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Increment access count and update last accessed
    const { error: updateError } = await supabase
      .from('address_permissions')
      .update({ 
        access_count: permissionData.access_count + 1,
        last_accessed: new Date().toISOString()
      })
      .eq('id', permissionData.id);
    
    if (updateError) {
      console.error('Error updating access count:', updateError);
    }
    
    // Log access
    const { error: logError } = await supabase
      .from('access_logs')
      .insert({
        permission_id: permissionData.id,
        accessed_fields: fields,
        ip_address: clientIp,
        user_agent: req.headers.get('user-agent') || undefined
      });
    
    if (logError) {
      console.error('Error logging access:', logError);
    }
    
    // Filter address fields based on permission settings
    const addressResponse: Record<string, any> = {};
    
    if (fields.includes('street') && permissionData.share_street) {
      addressResponse.street = addressData.street_address;
    }
    
    if (fields.includes('city') && permissionData.share_city) {
      addressResponse.city = addressData.city;
    }
    
    if (fields.includes('state') && permissionData.share_state) {
      addressResponse.state = addressData.state;
    }
    
    if (fields.includes('postal_code') && permissionData.share_postal_code) {
      addressResponse.postal_code = addressData.postal_code;
    }
    
    if (fields.includes('country') && permissionData.share_country) {
      addressResponse.country = addressData.country;
    }
    
    // Build response
    const response: any = {
      address: addressResponse,
      permission: {
        access_expiry: permissionData.access_expiry,
        access_count: permissionData.access_count + 1,
        max_access_count: permissionData.max_access_count
      }
    };
    
    // Include verification information if requested
    if (includeVerification) {
      response.verification = {
        status: addressData.verification_status,
        method: addressData.verification_method,
        date: addressData.verification_date,
        postal_verified: addressData.postal_verified || false
      };
    }
    
    // Send notification if configured
    if (permissionData.access_notification) {
      // TODO: Implement notification logic
      console.log('Access notification enabled, but notification system not implemented yet');
    }
    
    // Return success response
    return new Response(
      JSON.stringify(createSuccessResponse(response)),
      {
        status: 200,
        headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in address endpoint:', error);
    
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
