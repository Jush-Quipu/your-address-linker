
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
    let accessToken;
    let requestedFields = null;
    let includeVerification = false;
    const appId = req.headers.get('x-app-id');
    const sdkVersion = req.headers.get('x-sdk-version');
    
    // Log request information for monitoring
    console.log(`Address request: App ID: ${appId || 'not provided'}, SDK Version: ${sdkVersion || 'not provided'}`);
    
    // Check if the request is GET or POST
    if (req.method === "GET") {
      const url = new URL(req.url);
      accessToken = url.searchParams.get("access_token");
      const fields = url.searchParams.get("fields");
      if (fields) {
        requestedFields = fields.split(",");
      }
      includeVerification = url.searchParams.get("include_verification") === "true";
    } else if (req.method === "POST") {
      const body = await req.json();
      accessToken = body.access_token;
      requestedFields = body.fields || null;
      includeVerification = body.include_verification || false;
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
        JSON.stringify({ 
          error: "Access token has expired",
          expiredAt: permission.access_expiry
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 3. Check if max access count reached
    if (permission.max_access_count !== null && permission.access_count >= permission.max_access_count) {
      return new Response(
        JSON.stringify({ 
          error: "Maximum access count reached for this token",
          maxCount: permission.max_access_count,
          currentCount: permission.access_count
        }),
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
        JSON.stringify({ 
          error: "Address has not been verified yet",
          status: physicalAddress.verification_status
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get any linked wallets if available
    const { data: linkedWallets, error: walletsError } = await supabase
      .from("wallet_addresses")
      .select("address, chain_id, is_primary")
      .eq("user_id", permission.user_id)
      .order("is_primary", { ascending: false });
      
    if (walletsError) {
      console.error("Error fetching linked wallets:", walletsError);
    }

    // Log this access with enhanced information
    await supabase.from("access_logs").insert([
      {
        permission_id: permission.id,
        accessed_fields: requestedFields,
        ip_address: req.headers.get("x-forwarded-for") || "unknown",
        user_agent: req.headers.get("user-agent") || "unknown",
      },
    ]);

    // Increment access counter and update last accessed timestamp
    const { error: incrementError } = await supabase.rpc(
      "increment_counter",
      { row_id: permission.id }
    );

    if (incrementError) {
      console.error("Error incrementing counter:", incrementError);
    }

    await supabase
      .from("address_permissions")
      .update({ 
        access_count: permission.access_count + 1,
        last_accessed: new Date().toISOString() 
      })
      .eq("id", permission.id);

    // Return only the fields the app is allowed to access
    const allowedAddress: Record<string, string> = {};

    if (permission.share_street && (!requestedFields || requestedFields.includes("street_address") || requestedFields.includes("street"))) {
      allowedAddress.street = physicalAddress.street_address;
    }

    if (permission.share_city && (!requestedFields || requestedFields.includes("city"))) {
      allowedAddress.city = physicalAddress.city;
    }

    if (permission.share_state && (!requestedFields || requestedFields.includes("state"))) {
      allowedAddress.state = physicalAddress.state;
    }

    if (permission.share_postal_code && (!requestedFields || requestedFields.includes("postal_code") || requestedFields.includes("zip"))) {
      allowedAddress.postal_code = physicalAddress.postal_code;
    }

    if (permission.share_country && (!requestedFields || requestedFields.includes("country"))) {
      allowedAddress.country = physicalAddress.country;
    }

    // Prepare verification information if requested
    let verificationInfo = null;
    if (includeVerification) {
      verificationInfo = {
        status: physicalAddress.verification_status,
        method: physicalAddress.verification_method,
        date: physicalAddress.verification_date
      };
    }

    // Prepare permission information
    const permissionInfo = {
      app_id: permission.app_id,
      app_name: permission.app_name,
      access_count: permission.access_count + 1,
      max_access_count: permission.max_access_count,
      access_expiry: permission.access_expiry,
      permissions: {
        share_street: permission.share_street,
        share_city: permission.share_city,
        share_state: permission.share_state,
        share_postal_code: permission.share_postal_code,
        share_country: permission.share_country
      }
    };

    // If notification is enabled, send a notification (in a real app)
    if (permission.access_notification) {
      // Update the last notification timestamp
      await supabase
        .from("address_permissions")
        .update({ last_notification_at: new Date().toISOString() })
        .eq("id", permission.id);
        
      console.log("Access notification would be sent to user:", permission.user_id);
    }

    // Prepare the response with enhanced information
    const response: Record<string, any> = {
      address: allowedAddress,
      permission: permissionInfo
    };

    // Add verification info if requested
    if (verificationInfo) {
      response.verification = verificationInfo;
    }

    // Add linked wallets if available and requested
    if (linkedWallets && linkedWallets.length > 0 && includeVerification) {
      response.linked_wallets = linkedWallets;
    }

    return new Response(
      JSON.stringify(response),
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
