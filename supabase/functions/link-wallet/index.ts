
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createErrorResponse, createSuccessResponse, corsHeaders, checkRateLimit, getRateLimitHeaders } from '../_shared/apiHelpers.ts';
import { verifyZkProof } from '../_shared/zkpHelpers.ts';

serve(async (req) => {
  console.log('Request to link-wallet endpoint received:', req.url);
  
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
    const rateLimitResult = checkRateLimit(clientIp, 5, 60000); // 5 requests per minute
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
      wallet_address,
      chain_id = 1,
      proof_id,
      proof_token,
      app_id,
    } = requestBody;
    
    // Validate required parameters
    if (!wallet_address || !proof_id || !proof_token) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'invalid_request', 
          'Missing required parameters: wallet_address, proof_id, and proof_token are required'
        )),
        {
          status: 400,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Normalize wallet address
    const normalizedAddress = wallet_address.toLowerCase();
    
    // Create Supabase client
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.33.1');
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verify the ZKP proof
    const verificationResult = await verifyZkProof(proof_id, proof_token);
    
    if (!verificationResult.isValid) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'invalid_proof', 
          'The provided ZKP proof is invalid or has expired'
        )),
        {
          status: 400,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Get the user_id from the proof
    const { data: proofData, error: proofError } = await supabase
      .from('zkp_verifications')
      .select('user_id, physical_address_id')
      .eq('id', proof_id)
      .single();
      
    if (proofError || !proofData) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'proof_not_found', 
          'The provided proof was not found'
        )),
        {
          status: 404,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Check if wallet is already linked to this user
    const { data: existingLink, error: existingLinkError } = await supabase
      .from('wallet_address_links')
      .select('*')
      .eq('user_id', proofData.user_id)
      .eq('wallet_address', normalizedAddress)
      .eq('chain_id', chain_id)
      .maybeSingle();
      
    if (!existingLinkError && existingLink) {
      // Update the existing link to mark it as verified with ZKP
      const { data: updatedLink, error: updateError } = await supabase
        .from('wallet_address_links')
        .update({
          zkp_verified: true,
          zkp_proof_id: proof_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingLink.id)
        .select()
        .single();
        
      if (updateError) {
        console.error('Error updating wallet link:', updateError);
        return new Response(
          JSON.stringify(createErrorResponse(
            'update_failed', 
            'Failed to update the wallet link'
          )),
          {
            status: 500,
            headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      return new Response(
        JSON.stringify(createSuccessResponse({
          link_id: updatedLink.id,
          already_linked: true,
          zkp_verified: true
        })),
        {
          status: 200,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Create a new wallet-address link with ZKP verification
    const { data: newLink, error: newLinkError } = await supabase
      .from('wallet_address_links')
      .insert([
        {
          user_id: proofData.user_id,
          physical_address_id: proofData.physical_address_id,
          wallet_address: normalizedAddress,
          chain_id,
          zkp_verified: true,
          zkp_proof_id: proof_id,
          app_id: app_id || null,
        }
      ])
      .select()
      .single();
      
    if (newLinkError) {
      console.error('Error creating wallet link:', newLinkError);
      return new Response(
        JSON.stringify(createErrorResponse(
          'link_failed', 
          'Failed to create the wallet-address link'
        )),
        {
          status: 500,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Return success response
    return new Response(
      JSON.stringify(createSuccessResponse({
        link_id: newLink.id,
        zkp_verified: true
      })),
      {
        status: 201,
        headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in link-wallet endpoint:', error);
    
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
