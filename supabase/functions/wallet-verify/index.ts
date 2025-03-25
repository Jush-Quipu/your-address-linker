
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createErrorResponse, createSuccessResponse, corsHeaders, checkRateLimit, getRateLimitHeaders, ErrorCodes } from '../_shared/apiHelpers.ts';

// Define a minimal ethers-like interface for verifying messages
const verifyMessage = async (message: string, signature: string): Promise<string> => {
  try {
    // Import ethers dynamically to avoid the import issue with the CDN
    const { ethers } = await import('https://esm.sh/ethers@5.7.2');
    return ethers.utils.verifyMessage(message, signature);
  } catch (error) {
    console.error("Error importing or using ethers:", error);
    throw new Error("Failed to verify message signature");
  }
};

serve(async (req) => {
  console.log('Request to wallet-verify endpoint received:', req.url);
  
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
    const rateLimitResult = checkRateLimit(clientIp, 10, 60000); // 10 requests per minute (more strict for verification)
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
      signature,
      message,
      chain_id = 1, // Default to Ethereum mainnet
      user_id,
    } = requestBody;
    
    // Validate required parameters
    if (!wallet_address || !signature || !message || !user_id) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'invalid_request', 
          'Missing required parameters: wallet_address, signature, message, and user_id are required'
        )),
        {
          status: 400,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Normalize wallet address
    const normalizedAddress = wallet_address.toLowerCase();
    
    // Verify the signature
    try {
      const recoveredAddress = await verifyMessage(message, signature);
      
      if (recoveredAddress.toLowerCase() !== normalizedAddress) {
        return new Response(
          JSON.stringify(createErrorResponse(
            'invalid_signature', 
            'The signature does not match the provided wallet address'
          )),
          {
            status: 400,
            headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    } catch (error) {
      console.error('Error verifying signature:', error);
      return new Response(
        JSON.stringify(createErrorResponse(
          'invalid_signature', 
          'Invalid signature format', 
          error instanceof Error ? error.message : String(error)
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
    
    // Verify user_id exists
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user_id);
    
    if (userError || !userData.user) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'invalid_user', 
          'Invalid user_id'
        )),
        {
          status: 400,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Check if wallet address is already registered by this user
    const { data: existingWallet, error: existingWalletError } = await supabase
      .from('wallet_addresses')
      .select('*')
      .eq('user_id', user_id)
      .eq('address', normalizedAddress)
      .eq('chain_id', chain_id)
      .single();
    
    if (!existingWalletError && existingWallet) {
      // Wallet already exists for this user
      return new Response(
        JSON.stringify(createSuccessResponse({
          verified: true,
          wallet_id: existingWallet.id,
          is_primary: existingWallet.is_primary,
          already_registered: true
        })),
        {
          status: 200,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Check if wallet address is already registered by another user
    const { data: otherUserWallet, error: otherUserWalletError } = await supabase
      .from('wallet_addresses')
      .select('*')
      .eq('address', normalizedAddress)
      .eq('chain_id', chain_id)
      .single();
    
    if (!otherUserWalletError && otherUserWallet) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'wallet_already_registered', 
          'This wallet address is already registered by another user'
        )),
        {
          status: 409,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Check if this is the first wallet for the user (to set as primary)
    const { data: userWallets, error: userWalletsError } = await supabase
      .from('wallet_addresses')
      .select('id')
      .eq('user_id', user_id);
    
    const isPrimary = (!userWalletsError && (!userWallets || userWallets.length === 0));
    
    // Register the wallet address
    const { data: newWallet, error: newWalletError } = await supabase
      .from('wallet_addresses')
      .insert([
        {
          user_id,
          address: normalizedAddress,
          chain_id,
          is_primary: isPrimary
        }
      ])
      .select()
      .single();
    
    if (newWalletError || !newWallet) {
      console.error('Error registering wallet:', newWalletError);
      return new Response(
        JSON.stringify(createErrorResponse(
          'server_error', 
          'Error registering wallet address'
        )),
        {
          status: 500,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Return success response
    const responseData = createSuccessResponse({
      verified: true,
      wallet_id: newWallet.id,
      is_primary: newWallet.is_primary,
      already_registered: false
    });
    
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { 
        ...corsHeaders, 
        ...rateLimitHeaders, 
        'Content-Type': 'application/json' 
      },
    });
  } catch (error) {
    console.error('Error in wallet-verify endpoint:', error);
    
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
