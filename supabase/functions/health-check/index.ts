
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-app-id, x-sdk-version',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

// Handler function for all requests
serve(async (req) => {
  console.log('Request to health-check endpoint received:', req.url)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request')
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })
  }

  try {
    // Check request headers
    const appId = req.headers.get('x-app-id')
    const sdkVersion = req.headers.get('x-sdk-version')
    
    console.log('Request headers:', { 
      appId: appId || 'not provided', 
      sdkVersion: sdkVersion || 'not provided'
    })

    // Simple health check response
    const responseData = {
      success: true,
      data: {
        status: 'ok',
        service: 'SecureAddress Bridge API',
        version: 'v1',
        timestamp: new Date().toISOString()
      },
      meta: {
        version: 'v1',
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID()
      }
    }

    // Return the successful response
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'X-Request-Id': responseData.meta.requestId,
      }
    })
  } catch (error) {
    console.error('Error in health-check endpoint:', error)
    
    // Return error response
    const errorResponse = {
      success: false,
      error: {
        code: 'server_error',
        message: 'An error occurred while processing the request',
        details: error instanceof Error ? error.message : String(error)
      },
      meta: {
        version: 'v1',
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID()
      }
    }
    
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'X-Request-Id': errorResponse.meta.requestId,
      }
    })
  }
})
