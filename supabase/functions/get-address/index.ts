
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
    let requestedFields = null;
    
    // Check if the request is GET or POST
    if (req.method === "GET") {
      const url = new URL(req.url);
      accessToken = url.searchParams.get("access_token");
      const fields = url.searchParams.get("fields");
      if (fields) {
        requestedFields = fields.split(",");
      }
    } else if (req.method === "POST") {
      const body = await req.json();
      accessToken = body.access_token;
      requestedFields = body.fields || null;
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

    // Check enhanced permission validity
    // 1. Check if revoked
    if (permission.revoked) {
      return new Response(
        JSON.stringify({ 
          error: "Access token has been revoked",
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
        JSON.stringify({ error: "Access token has expired" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 3. Check if max access count reached
    if (permission.max_access_count !== null && permission.access_count >= permission.max_access_count) {
      return new Response(
        JSON.stringify({ error: "Maximum access count reached for this token" }),
        {
          status: 403,
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
        accessed_fields: requestedFields,
        ip_address: req.headers.get("x-forwarded-for") || "unknown",
        user_agent: req.headers.get("user-agent") || "unknown",
      },
    ]);

    // Increment access counter and update last accessed timestamp
    await supabase
      .from("address_permissions")
      .update({ 
        access_count: permission.access_count + 1,
        last_accessed: new Date().toISOString() 
      })
      .eq("id", permission.id);

    // Return only the fields the app is allowed to access
    const allowedAddress: Record<string, string> = {};

    if (permission.share_street && (!requestedFields || requestedFields.includes("street_address"))) {
      allowedAddress.street_address = physicalAddress.street_address;
    }

    if (permission.share_city && (!requestedFields || requestedFields.includes("city"))) {
      allowedAddress.city = physicalAddress.city;
    }

    if (permission.share_state && (!requestedFields || requestedFields.includes("state"))) {
      allowedAddress.state = physicalAddress.state;
    }

    if (permission.share_postal_code && (!requestedFields || requestedFields.includes("postal_code"))) {
      allowedAddress.postal_code = physicalAddress.postal_code;
    }

    if (permission.share_country && (!requestedFields || requestedFields.includes("country"))) {
      allowedAddress.country = physicalAddress.country;
    }

    // If notification is enabled, send a notification (in a real app)
    if (permission.access_notification) {
      // Update the last notification timestamp
      await supabase
        .from("address_permissions")
        .update({ last_notification_at: new Date().toISOString() })
        .eq("id", permission.id);
        
      console.log("Access notification would be sent to user:", permission.user_id);
    }

    return new Response(
      JSON.stringify({
        app_id: permission.app_id,
        app_name: permission.app_name,
        address: allowedAddress,
        access_count: permission.access_count + 1,
        max_access_count: permission.max_access_count,
        access_expiry: permission.access_expiry
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
