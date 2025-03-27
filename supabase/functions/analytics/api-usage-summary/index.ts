
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.33.1';

// CORS headers for browser preflight requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create response helper functions
const createErrorResponse = (code: string, message: string, details?: any) => ({
  error: { code, message, details }
});

const createSuccessResponse = (data: any) => ({
  data
});

serve(async (req) => {
  console.log('API usage summary request received:', req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
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
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify(createErrorResponse('unauthorized', 'Missing or invalid Authorization header')),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Extract the token
    const token = authHeader.split(' ')[1];
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verify the token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify(createErrorResponse('unauthorized', 'Invalid token')),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Get URL parameters
    const url = new URL(req.url);
    const appId = url.searchParams.get('app_id');
    const timeInterval = url.searchParams.get('time_interval') || '7 days';
    
    if (!appId) {
      return new Response(
        JSON.stringify(createErrorResponse('invalid_request', 'Missing app_id parameter')),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Verify that the app belongs to the user
    const { data: app, error: appError } = await supabase
      .from('developer_apps')
      .select('id, user_id')
      .eq('id', appId)
      .single();
      
    if (appError || !app || app.user_id !== user.id) {
      return new Response(
        JSON.stringify(createErrorResponse('not_found', 'App not found or does not belong to the user')),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Get API usage summary
    const { data: summary, error: summaryError } = await supabase.rpc(
      'api_usage_summary',
      { app_id_param: appId, time_interval: timeInterval }
    );
    
    if (summaryError) {
      throw summaryError;
    }
    
    // Get usage by endpoint
    const { data: byEndpoint, error: endpointError } = await supabase
      .from('developer_api_usage')
      .select('endpoint, count(*)')
      .eq('app_id', appId)
      .gte('created_at', new Date(Date.now() - parseTimeInterval(timeInterval)).toISOString())
      .group('endpoint')
      .order('count', { ascending: false });
      
    if (endpointError) {
      throw endpointError;
    }
    
    // Get usage by status code
    const { data: byStatus, error: statusError } = await supabase
      .from('developer_api_usage')
      .select('response_status, count(*)')
      .eq('app_id', appId)
      .gte('created_at', new Date(Date.now() - parseTimeInterval(timeInterval)).toISOString())
      .group('response_status')
      .order('response_status', { ascending: true });
      
    if (statusError) {
      throw statusError;
    }
    
    // Get usage over time (daily)
    const { data: daily, error: dailyError } = await supabase
      .from('developer_api_usage')
      .select('created_at')
      .eq('app_id', appId)
      .gte('created_at', new Date(Date.now() - parseTimeInterval(timeInterval)).toISOString());
      
    if (dailyError) {
      throw dailyError;
    }
    
    // Group daily data by day
    const dailyData = daily.reduce((acc, item) => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    
    // Convert to array of objects
    const dailyArray = Object.entries(dailyData).map(([date, count]) => ({
      date,
      requests: count
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    // Get quota information
    const { data: quotaData, error: quotaError } = await supabase
      .from('api_quota_usage')
      .select('request_count')
      .eq('app_id', appId)
      .eq('month', new Date().toISOString().slice(0, 7) + '-01') // Current month
      .single();
      
    if (quotaError && quotaError.code !== 'PGRST116') { // Ignore "not found" error
      throw quotaError;
    }
    
    // Get app quota limit
    const { data: appData, error: appQuotaError } = await supabase
      .from('developer_apps')
      .select('monthly_request_limit')
      .eq('id', appId)
      .single();
      
    if (appQuotaError) {
      throw appQuotaError;
    }
    
    const quota = {
      used: quotaData?.request_count || 0,
      limit: appData.monthly_request_limit,
      reset_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString()
    };
    
    // Return all the data
    return new Response(
      JSON.stringify(createSuccessResponse({
        summary: summary[0],
        by_endpoint: byEndpoint.map((item) => ({
          endpoint: item.endpoint,
          requests: item.count
        })),
        by_status: byStatus.map((item) => ({
          status_code: item.response_status,
          count: item.count
        })),
        daily: dailyArray,
        quota
      })),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error getting API usage summary:', error);
    
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

// Helper function to parse time interval strings to milliseconds
function parseTimeInterval(interval: string): number {
  const match = interval.match(/^(\d+)\s*(day|days|hour|hours|minute|minutes)$/i);
  if (!match) {
    // Default to 7 days if invalid format
    return 7 * 24 * 60 * 60 * 1000;
  }
  
  const amount = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  
  if (unit === 'day' || unit === 'days') {
    return amount * 24 * 60 * 60 * 1000;
  } else if (unit === 'hour' || unit === 'hours') {
    return amount * 60 * 60 * 1000;
  } else if (unit === 'minute' || unit === 'minutes') {
    return amount * 60 * 1000;
  }
  
  // Default to 7 days
  return 7 * 24 * 60 * 60 * 1000;
}
