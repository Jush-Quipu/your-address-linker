
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createErrorResponse, createSuccessResponse, corsHeaders, checkRateLimit, getRateLimitHeaders, ErrorCodes } from '../_shared/apiHelpers.ts';

// Validate the access token
async function validateAccessToken(token: string, supabase: any) {
  try {
    const { data, error } = await supabase
      .from('access_tokens')
      .select('*')
      .eq('token', token)
      .eq('revoked', false)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    if (error || !data) {
      return { valid: false };
    }
    
    // Update the last_used_at timestamp
    await supabase
      .from('access_tokens')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', data.id);
    
    return { valid: true, data };
  } catch (error) {
    console.error('Error validating token:', error);
    return { valid: false };
  }
}

serve(async (req) => {
  console.log('Request to userinfo endpoint received:', req.url);
  
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

    // Check if the Authorization header is present
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'invalid_request', 
          'Missing or invalid Authorization header'
        )),
        {
          status: 401,
          headers: { 
            ...corsHeaders, 
            ...rateLimitHeaders, 
            'Content-Type': 'application/json',
            'WWW-Authenticate': 'Bearer error="invalid_request"'
          },
        }
      );
    }
    
    // Extract the access token
    const accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Create Supabase client
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.33.1');
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Validate the access token
    const validationResult = await validateAccessToken(accessToken, supabase);
    
    if (!validationResult.valid) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'invalid_token', 
          'The access token is invalid or has expired'
        )),
        {
          status: 401,
          headers: { 
            ...corsHeaders, 
            ...rateLimitHeaders, 
            'Content-Type': 'application/json',
            'WWW-Authenticate': 'Bearer error="invalid_token"'
          },
        }
      );
    }
    
    // Get the token data
    const tokenData = validationResult.data;
    
    // Get user information
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(tokenData.user_id);
    
    if (userError || !userData.user) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'server_error', 
          'Error retrieving user information'
        )),
        {
          status: 500,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Get user profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', tokenData.user_id)
      .single();
    
    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }
    
    // Get user's physical address
    const { data: addressData, error: addressError } = await supabase
      .from('physical_addresses')
      .select('*')
      .eq('user_id', tokenData.user_id)
      .eq('verification_status', 'verified')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (addressError) {
      console.error('Error fetching address:', addressError);
    }
    
    // Parse the scope to determine what information to include
    const scopes = tokenData.scope.split(' ');
    
    // Basic user info that's always included
    const userInfo = {
      sub: tokenData.user_id,
      email: userData.user.email,
      email_verified: userData.user.email_confirmed_at !== null,
      name: profileData?.full_name || null,
    };
    
    // Add address information based on scope
    if (scopes.includes('address') && addressData) {
      const addressInfo: Record<string, string | null> = {};
      
      // Only include fields that are allowed based on scope and permission settings
      if (scopes.includes('address.street_address') || scopes.includes('address')) {
        addressInfo.street_address = addressData.street_address;
      }
      
      if (scopes.includes('address.city') || scopes.includes('address')) {
        addressInfo.city = addressData.city;
      }
      
      if (scopes.includes('address.state') || scopes.includes('address')) {
        addressInfo.state = addressData.state;
      }
      
      if (scopes.includes('address.postal_code') || scopes.includes('address')) {
        addressInfo.postal_code = addressData.postal_code;
      }
      
      if (scopes.includes('address.country') || scopes.includes('address')) {
        addressInfo.country = addressData.country;
      }
      
      userInfo.address = addressInfo;
    }
    
    // Log access
    const { error: logError } = await supabase
      .from('access_logs')
      .insert([
        {
          permission_id: null, // Direct token access
          user_id: tokenData.user_id,
          app_id: tokenData.app_id,
          token_id: tokenData.id,
          ip_address: clientIp,
          user_agent: req.headers.get('user-agent') || null,
          accessed_fields: Object.keys(userInfo)
        }
      ]);
    
    if (logError) {
      console.error('Error logging access:', logError);
    }
    
    // Return the user information
    const responseData = createSuccessResponse(userInfo);
    
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { 
        ...corsHeaders, 
        ...rateLimitHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      },
    });
  } catch (error) {
    console.error('Error in userinfo endpoint:', error);
    
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
