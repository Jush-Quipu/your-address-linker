
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Define CORS headers for browser compatibility
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-app-id, x-carrier-id, x-carrier-key, x-shipment-details",
};

// Create a Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Supported carriers configuration
const SUPPORTED_CARRIERS = {
  "usps": {
    name: "USPS",
    authKey: Deno.env.get("USPS_API_KEY") || "",
    baseUrl: "https://secure.shippingapis.com/ShippingAPI.dll",
    services: ["Priority", "First-Class", "Ground", "Express"]
  },
  "fedex": {
    name: "FedEx", 
    authKey: Deno.env.get("FEDEX_API_KEY") || "",
    baseUrl: "https://apis.fedex.com",
    services: ["Ground", "2Day", "Express", "Overnight"]
  },
  "ups": {
    name: "UPS",
    authKey: Deno.env.get("UPS_API_KEY") || "",
    baseUrl: "https://onlinetools.ups.com/api",
    services: ["Ground", "Next Day Air", "2nd Day Air", "3 Day Select"]
  }
};

// Verify if a carrier's API key is valid
async function verifyCarrierApiKey(carrierId: string, apiKey: string): Promise<boolean> {
  if (!SUPPORTED_CARRIERS[carrierId]) {
    return false;
  }
  
  // Mock verification for now
  // In a real implementation, you would verify with the carrier's API
  return apiKey.length > 10;
}

// Process a shipment with the carrier API
async function processShipment(
  carrierId: string, 
  recipientAddress: any, 
  shipmentDetails: any
): Promise<any> {
  try {
    const carrier = SUPPORTED_CARRIERS[carrierId];
    if (!carrier) {
      throw new Error(`Unsupported carrier: ${carrierId}`);
    }
    
    console.log(`Processing shipment with ${carrier.name}`, {
      address: recipientAddress,
      shipment: shipmentDetails
    });
    
    // Mock shipment processing for now
    // In a real implementation, you would call the carrier's API
    const trackingNumber = `${carrier.name.substr(0, 2)}${Date.now().toString().substr(-8)}US`;
    
    return {
      success: true,
      carrier: carrier.name,
      trackingNumber,
      labelUrl: `https://example.com/labels/${trackingNumber}.pdf`,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      cost: {
        currency: "USD",
        amount: Math.random() * 20 + 5
      }
    };
  } catch (error) {
    console.error(`Error processing shipment with ${carrierId}:`, error);
    throw error;
  }
}

// Update shipment record with carrier response
async function updateShipmentRecord(
  shipmentId: string, 
  carrierResponse: any
): Promise<void> {
  try {
    await supabase
      .from("shipments")
      .update({
        tracking_number: carrierResponse.trackingNumber,
        status: "label_created",
        carrier_details: carrierResponse,
        updated_at: new Date().toISOString()
      })
      .eq("id", shipmentId);
      
    console.log(`Updated shipment record ${shipmentId} with tracking number ${carrierResponse.trackingNumber}`);
  } catch (error) {
    console.error(`Error updating shipment record:`, error);
    // Continue anyway as this is a non-critical error
  }
}

// Get address for a shipping token
async function getAddressForShippingToken(
  token: string, 
  carrierId: string
): Promise<any> {
  try {
    // Validate that this is a shipping token
    if (!token.startsWith('ship_')) {
      throw new Error('Invalid shipping token format');
    }
    
    // Get the permission record
    const { data: permission, error } = await supabase
      .from("address_permissions")
      .select("*")
      .eq("access_token", token)
      .maybeSingle();
      
    if (error || !permission) {
      throw new Error('Invalid shipping token or permission not found');
    }
    
    // Check if token is expired
    if (permission.access_expiry && new Date(permission.access_expiry) < new Date()) {
      throw new Error('Shipping token has expired');
    }
    
    // Check if token is revoked
    if (permission.revoked) {
      throw new Error('Shipping token has been revoked');
    }
    
    // Check if max access count is reached
    if (permission.max_access_count !== null && permission.access_count >= permission.max_access_count) {
      throw new Error('Maximum access count reached for this shipping token');
    }
    
    // Check if this is a shipping token with metadata
    const metadata = permission.metadata || {};
    if (!metadata.isShippingCarrier) {
      throw new Error('This token is not authorized for shipping carrier access');
    }
    
    // Check if carrier is allowed
    if (!metadata.allowedCarriers.includes(carrierId)) {
      throw new Error(`Carrier ${carrierId} is not authorized for this token`);
    }
    
    // Get the user's address
    const { data: address, error: addressError } = await supabase
      .from("physical_addresses")
      .select("*")
      .eq("user_id", permission.user_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
      
    if (addressError || !address) {
      throw new Error('Address not found for user');
    }
    
    // Increment access count
    await supabase.rpc(
      "increment_counter",
      { row_id: permission.id }
    );
    
    // Update last accessed
    await supabase
      .from("address_permissions")
      .update({ 
        last_accessed: new Date().toISOString() 
      })
      .eq("id", permission.id);
      
    // Log this access
    await supabase
      .from("access_logs")
      .insert([{
        permission_id: permission.id,
        accessed_fields: ["street_address", "city", "state", "postal_code", "country"],
        user_agent: "Carrier API - " + carrierId,
        ip_address: "carrier-api"
      }]);
      
    return {
      address: {
        street_address: address.street_address,
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        country: address.country
      },
      userId: permission.user_id,
      permissionId: permission.id,
      requiresConfirmation: metadata.requireDeliveryConfirmation || false
    };
  } catch (error) {
    console.error('Error getting address for shipping token:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const endpoint = url.pathname.split("/").pop();
    
    // Address resolution endpoint for carriers
    if (endpoint === "resolve" && req.method === "POST") {
      const body = await req.json();
      const shippingToken = body.token;
      const carrierId = req.headers.get("x-carrier-id") || body.carrierId;
      const carrierKey = req.headers.get("x-carrier-key") || body.carrierKey;
      
      if (!shippingToken) {
        return new Response(
          JSON.stringify({ error: "Missing shipping token" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (!carrierId) {
        return new Response(
          JSON.stringify({ error: "Missing carrier identifier" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (!carrierKey) {
        return new Response(
          JSON.stringify({ error: "Missing carrier API key" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Verify carrier API key
      const isValidCarrierKey = await verifyCarrierApiKey(carrierId, carrierKey);
      if (!isValidCarrierKey) {
        return new Response(
          JSON.stringify({ error: "Invalid carrier API key" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Get address for shipping token
      const addressData = await getAddressForShippingToken(shippingToken, carrierId);
      
      return new Response(
        JSON.stringify({
          recipient: {
            address: addressData.address
          },
          requires_confirmation: addressData.requiresConfirmation
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Shipment creation endpoint
    if (endpoint === "create" && req.method === "POST") {
      const body = await req.json();
      const shippingToken = body.token;
      const carrierId = req.headers.get("x-carrier-id") || body.carrierId;
      const carrierKey = req.headers.get("x-carrier-key") || body.carrierKey;
      const shipmentDetails = body.shipment;
      
      if (!shippingToken || !carrierId || !carrierKey || !shipmentDetails) {
        return new Response(
          JSON.stringify({ 
            error: "Missing required parameters",
            required: ["token", "carrierId", "carrierKey", "shipment"] 
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Verify carrier key
      const isValidCarrierKey = await verifyCarrierApiKey(carrierId, carrierKey);
      if (!isValidCarrierKey) {
        return new Response(
          JSON.stringify({ error: "Invalid carrier API key" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Get address data
      const addressData = await getAddressForShippingToken(shippingToken, carrierId);
      
      // Validate shipping service is allowed
      const metadata = (await supabase
        .from("address_permissions")
        .select("metadata")
        .eq("id", addressData.permissionId)
        .single()).data?.metadata || {};
        
      if (!metadata.allowedShippingMethods?.includes(shipmentDetails.service)) {
        return new Response(
          JSON.stringify({ 
            error: "Shipping service not allowed",
            service: shipmentDetails.service,
            allowed: metadata.allowedShippingMethods 
          }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Create shipment record
      const { data: shipment, error: shipmentError } = await supabase
        .from("shipments")
        .insert([{
          permission_id: addressData.permissionId,
          user_id: addressData.userId,
          carrier: carrierId,
          service: shipmentDetails.service,
          status: "processing",
          package_details: {
            weight: shipmentDetails.weight,
            dimensions: shipmentDetails.dimensions,
            type: shipmentDetails.packageType
          }
        }])
        .select()
        .single();
        
      if (shipmentError) {
        console.error("Error creating shipment record:", shipmentError);
        return new Response(
          JSON.stringify({ error: "Failed to create shipment record" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Process shipment with carrier
      try {
        const carrierResponse = await processShipment(
          carrierId,
          addressData.address,
          shipmentDetails
        );
        
        // Update shipment record with carrier response
        await updateShipmentRecord(shipment.id, carrierResponse);
        
        return new Response(
          JSON.stringify({
            shipment_id: shipment.id,
            tracking_number: carrierResponse.trackingNumber,
            label_url: carrierResponse.labelUrl,
            carrier: carrierResponse.carrier,
            estimated_delivery: carrierResponse.estimatedDelivery,
            cost: carrierResponse.cost
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (error) {
        console.error("Error processing shipment with carrier:", error);
        
        // Update shipment record with error
        await supabase
          .from("shipments")
          .update({
            status: "failed",
            carrier_details: { error: error.message || "Unknown carrier error" },
            updated_at: new Date().toISOString()
          })
          .eq("id", shipment.id);
          
        return new Response(
          JSON.stringify({ 
            error: "Failed to process shipment with carrier",
            details: error.message || "Unknown carrier error"
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
    // Tracking webhook endpoint for carriers to send status updates
    if (endpoint === "tracking" && req.method === "POST") {
      const body = await req.json();
      const carrierId = req.headers.get("x-carrier-id") || body.carrierId;
      const carrierKey = req.headers.get("x-carrier-key") || body.carrierKey;
      const trackingNumber = body.tracking_number;
      const status = body.status;
      const details = body.details || {};
      
      if (!carrierId || !carrierKey || !trackingNumber || !status) {
        return new Response(
          JSON.stringify({ 
            error: "Missing required parameters",
            required: ["carrierId", "carrierKey", "tracking_number", "status"] 
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Verify carrier key
      const isValidCarrierKey = await verifyCarrierApiKey(carrierId, carrierKey);
      if (!isValidCarrierKey) {
        return new Response(
          JSON.stringify({ error: "Invalid carrier API key" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Find the shipment
      const { data: shipment, error: shipmentError } = await supabase
        .from("shipments")
        .select("id, user_id, permission_id")
        .eq("tracking_number", trackingNumber)
        .eq("carrier", carrierId)
        .maybeSingle();
        
      if (shipmentError || !shipment) {
        return new Response(
          JSON.stringify({ 
            error: "Shipment not found for this tracking number and carrier",
            tracking: trackingNumber,
            carrier: carrierId
          }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Update shipment status
      await supabase
        .from("shipments")
        .update({
          status: status,
          tracking_details: {
            ...details,
            last_updated: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq("id", shipment.id);
        
      // If delivery confirmation is required, check status
      if (status === "delivered") {
        // Get the permission to check if delivery confirmation is required
        const { data: permission } = await supabase
          .from("address_permissions")
          .select("metadata")
          .eq("id", shipment.permission_id)
          .single();
          
        const metadata = permission?.metadata || {};
        
        if (metadata.requireDeliveryConfirmation) {
          // Send notification to user about delivery
          // In a real implementation, you would integrate with a notification service
          console.log(`Delivery confirmation required for shipment ${shipment.id}`);
          
          // Update shipment to indicate confirmation needed
          await supabase
            .from("shipments")
            .update({
              confirmation_required: true,
              confirmation_status: "pending"
            })
            .eq("id", shipment.id);
        }
      }
      
      return new Response(
        JSON.stringify({ 
          success: true,
          message: "Tracking status updated successfully" 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Fallback for unknown endpoints
    return new Response(
      JSON.stringify({ 
        error: "Unknown endpoint",
        available_endpoints: ["/resolve", "/create", "/tracking"] 
      }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: error.message || "Unknown error"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
