
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createSuccessResponse, createErrorResponse } from "../../functions/_shared/apiHelpers.ts";

// Define CORS headers for browser compatibility
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-app-id, x-sdk-version",
};

serve(async (req) => {
  // Generate a unique request ID for tracking
  const requestId = crypto.randomUUID();
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get version information
    const version = "v1";
    const environment = Deno.env.get("ENVIRONMENT") || "production";
    
    // Create response with standard format
    const response = createSuccessResponse(
      {
        status: "ok",
        message: "API is operational",
        timestamp: new Date().toISOString(),
        environment
      },
      {
        version,
        timestamp: new Date().toISOString(),
        requestId
      }
    );
    
    // Log the health check request for monitoring
    console.log(`Health check request: Request ID: ${requestId}`);
    
    // Return the response
    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing health check:", error);
    
    // Create error response with standard format
    const errorResponse = createErrorResponse(
      "internal_server_error",
      "Failed to process health check",
      { message: error instanceof Error ? error.message : "Unknown error" },
      {
        version: "v1",
        timestamp: new Date().toISOString(),
        requestId
      }
    );
    
    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
