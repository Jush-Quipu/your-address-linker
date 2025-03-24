
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Define CORS headers for browser compatibility
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
      .select("*")
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
          error: "Token has expired" 
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
          error: "Maximum access count reached" 
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Token is valid
    return new Response(
      JSON.stringify({
        valid: true,
        app_id: permission.app_id,
        app_name: permission.app_name,
        access_count: permission.access_count,
        max_access_count: permission.max_access_count,
        access_expiry: permission.access_expiry,
        permissions: {
          share_street: permission.share_street,
          share_city: permission.share_city,
          share_state: permission.share_state,
          share_postal_code: permission.share_postal_code,
          share_country: permission.share_country
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing request:", error.message);
    
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
