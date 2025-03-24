
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
    let accessToken;
    
    // Check if the request is GET or POST
    if (req.method === "GET") {
      const url = new URL(req.url);
      accessToken = url.searchParams.get("access_token");
    } else if (req.method === "POST") {
      const body = await req.json();
      accessToken = body.access_token;
    } else {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate the access token
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: "Missing access token" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get the permission from the database
    const { data: permission, error: permissionError } = await supabase
      .from("address_permissions")
      .select("*")
      .eq("access_token", accessToken)
      .maybeSingle();

    if (permissionError || !permission) {
      return new Response(
        JSON.stringify({ error: "Invalid access token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if permission has expired
    if (permission.access_expiry && new Date(permission.access_expiry) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Access token has expired" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get the user's physical address
    const { data: physicalAddress, error: addressError } = await supabase
      .from("physical_addresses")
      .select("*")
      .eq("user_id", permission.user_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (addressError || !physicalAddress) {
      return new Response(
        JSON.stringify({ error: "No address found for this user" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check verification status
    if (physicalAddress.verification_status !== "verified") {
      return new Response(
        JSON.stringify({ error: "Address has not been verified yet" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Log this access
    await supabase.from("access_logs").insert([
      {
        permission_id: permission.id,
        ip_address: req.headers.get("x-forwarded-for") || "unknown",
        user_agent: req.headers.get("user-agent") || "unknown",
      },
    ]);

    // Update last accessed timestamp
    await supabase
      .from("address_permissions")
      .update({ last_accessed: new Date().toISOString() })
      .eq("id", permission.id);

    // Return only the fields the app is allowed to access
    const allowedAddress: Record<string, string> = {};

    if (permission.share_street) {
      allowedAddress.street_address = physicalAddress.street_address;
    }

    if (permission.share_city) {
      allowedAddress.city = physicalAddress.city;
    }

    if (permission.share_state) {
      allowedAddress.state = physicalAddress.state;
    }

    if (permission.share_postal_code) {
      allowedAddress.postal_code = physicalAddress.postal_code;
    }

    if (permission.share_country) {
      allowedAddress.country = physicalAddress.country;
    }

    return new Response(
      JSON.stringify({
        app_id: permission.app_id,
        app_name: permission.app_name,
        address: allowedAddress,
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
