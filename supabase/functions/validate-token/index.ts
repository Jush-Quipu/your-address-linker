
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Define CORS headers for browser compatibility
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-app-id, x-sdk-version",
};

// Create a Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Extract the access token from the request
    const authHeader = req.headers.get('authorization') || '';
    const accessToken = authHeader.replace('Bearer ', '');
    const appId = req.headers.get('x-app-id');
    const sdkVersion = req.headers.get('x-sdk-version');
    
    // Log the request for monitoring
    console.log(`Token validation request: App ID: ${appId || 'not provided'}, SDK Version: ${sdkVersion || 'not provided'}`);
    
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: "Missing access token" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate the token
    const { data: permission, error: permissionError } = await supabase
      .from("address_permissions")
      .select(`
        *,
        physical_addresses:physical_addresses!inner(verification_status)
      `)
      .eq("access_token", accessToken)
      .maybeSingle();

    if (permissionError || !permission) {
      return new Response(
        JSON.stringify({ 
          valid: false,
          error: "Invalid access token"
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check enhanced permission validity
    // 1. Check if revoked
    if (permission.revoked) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: "Token has been revoked",
          reason: permission.revocation_reason || "Unknown reason" 
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 2. Check if permission has expired
    if (permission.access_expiry && new Date(permission.access_expiry) < new Date()) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: "Token has expired",
          expiredAt: permission.access_expiry 
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 3. Check if max access count reached
    if (
      permission.max_access_count !== null && 
      permission.access_count >= permission.max_access_count
    ) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: "Maximum access count reached",
          maxCount: permission.max_access_count,
          currentCount: permission.access_count
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Token is valid, increment access counter for analytics
    const { error: incrementError } = await supabase.rpc(
      "increment_counter",
      { row_id: permission.id }
    );

    if (incrementError) {
      console.error("Error incrementing counter:", incrementError);
    }

    // Update last accessed timestamp
    const { error: updateError } = await supabase
      .from("address_permissions")
      .update({ last_accessed: new Date().toISOString() })
      .eq("id", permission.id);

    if (updateError) {
      console.error("Error updating last accessed timestamp:", updateError);
    }

    // Get verification information for enhanced response
    const verificationStatus = permission.physical_addresses?.verification_status || 'unknown';

    // Token is valid
    return new Response(
      JSON.stringify({
        valid: true,
        app_id: permission.app_id,
        app_name: permission.app_name,
        access_count: permission.access_count + 1,
        max_access_count: permission.max_access_count,
        access_expiry: permission.access_expiry,
        verification: {
          status: verificationStatus
        },
        permissions: {
          share_street: permission.share_street,
          share_city: permission.share_city,
          share_state: permission.share_state,
          share_postal_code: permission.share_postal_code,
          share_country: permission.share_country
        },
        issuedAt: permission.created_at,
        lastAccessed: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing request:", error.message);
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
