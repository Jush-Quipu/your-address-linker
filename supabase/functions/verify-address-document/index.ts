
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createErrorResponse, createSuccessResponse, corsHeaders, checkRateLimit, getRateLimitHeaders, ErrorCodes } from '../_shared/apiHelpers.ts';

serve(async (req) => {
  console.log('Request to verify-address-document endpoint received:', req.url);
  
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
    
    // Check rate limit - strict for document uploads (5 per minute)
    const rateLimitResult = checkRateLimit(clientIp, 5, 60000);
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
      address_id,
      document_type,
      document_data,  // Base64 encoded document image/pdf
      metadata
    } = requestBody;
    
    // Validate required parameters
    if (!user_id || !address_id || !document_type || !document_data) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'invalid_request', 
          'Missing required parameters: user_id, address_id, document_type, and document_data are required'
        )),
        {
          status: 400,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Validate document type
    const validDocumentTypes = ['utility_bill', 'bank_statement', 'government_id', 'tax_document'];
    if (!validDocumentTypes.includes(document_type)) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'invalid_request', 
          `Invalid document_type. Must be one of: ${validDocumentTypes.join(', ')}`
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
    
    // Verify address exists and belongs to user
    const { data: addressData, error: addressError } = await supabase
      .from('physical_addresses')
      .select('id')
      .eq('id', address_id)
      .eq('user_id', user_id)
      .single();
      
    if (addressError || !addressData) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'not_found', 
          'Address not found or does not belong to the user'
        )),
        {
          status: 404,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // In a real implementation, we would:
    // 1. Store the document securely (encrypted)
    // 2. Send it to a verification service or queue it for manual review
    // 3. Update verification status accordingly
    
    // For now, we'll simulate a verification process
    // Update the address verification status to pending
    const { data: updateData, error: updateError } = await supabase
      .from('physical_addresses')
      .update({
        verification_status: 'pending',
        verification_method: 'document_upload',
        updated_at: new Date().toISOString()
      })
      .eq('id', address_id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating address verification status:', updateError);
      return new Response(
        JSON.stringify(createErrorResponse(
          'server_error', 
          'Error updating address verification status'
        )),
        {
          status: 500,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Record verification attempt for audit purposes
    const { error: logError } = await supabase
      .from('address_verification_logs')
      .insert([{
        physical_address_id: address_id,
        user_id: user_id,
        verification_type: 'document_upload',
        document_type: document_type,
        status: 'pending',
        metadata: metadata || {}
      }]);
    
    if (logError) {
      console.error('Error logging verification attempt:', logError);
      // Non-critical error, continue with response
    }
    
    // Return success response
    return new Response(
      JSON.stringify(createSuccessResponse({
        verification_id: updateData.id,
        status: 'pending',
        message: 'Document received and verification process initiated',
        estimated_time: '24-48 hours'
      })),
      {
        status: 200,
        headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in verify-address-document endpoint:', error);
    
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
