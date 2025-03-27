
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createErrorResponse, createSuccessResponse, corsHeaders, checkRateLimit, getRateLimitHeaders } from '../_shared/apiHelpers.ts';

serve(async (req) => {
  console.log('Request to analytics endpoint received:', req.url);
  
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
    const rateLimitResult = checkRateLimit(clientIp, 20, 60000); // 20 requests per minute
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

    // Get the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'unauthorized', 
          'Missing or invalid Authorization header'
        )),
        {
          status: 401,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Extract the token
    const token = authHeader.split(' ')[1];
    
    // Create Supabase client
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.33.1');
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verify the token and get the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'unauthorized', 
          'Invalid token'
        )),
        {
          status: 401,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse the URL to get query parameters
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Check what type of analytics is being requested
    const analyticsType = pathParts.length > 1 ? pathParts[1] : null;
    
    if (!analyticsType) {
      return new Response(
        JSON.stringify(createErrorResponse(
          'invalid_request', 
          'Analytics type is required'
        )),
        {
          status: 400,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle different analytics types
    switch (analyticsType) {
      case 'api-usage': {
        const appId = url.searchParams.get('app_id');
        const timeRange = url.searchParams.get('time_range') || '7d';
        
        if (!appId) {
          return new Response(
            JSON.stringify(createErrorResponse(
              'invalid_request', 
              'app_id parameter is required'
            )),
            {
              status: 400,
              headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
        
        // Verify app ownership
        const { data: app, error: appError } = await supabase
          .from('developer_apps')
          .select('id')
          .eq('id', appId)
          .eq('user_id', user.id)
          .single();
          
        if (appError || !app) {
          return new Response(
            JSON.stringify(createErrorResponse(
              'not_found', 
              'App not found or does not belong to the user'
            )),
            {
              status: 404,
              headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
        
        // Parse time range to SQL interval
        let timeInterval;
        switch (timeRange) {
          case '24h':
            timeInterval = '1 day';
            break;
          case '7d':
            timeInterval = '7 days';
            break;
          case '30d':
            timeInterval = '30 days';
            break;
          case '90d':
            timeInterval = '90 days';
            break;
          default:
            timeInterval = '7 days';
        }
        
        // Get API usage data
        
        // 1. Get daily usage
        const { data: dailyData, error: dailyError } = await supabase
          .from('developer_api_usage')
          .select('created_at')
          .eq('app_id', appId)
          .gte('created_at', `now() - interval '${timeInterval}'`)
          .order('created_at', { ascending: true });
          
        if (dailyError) {
          console.error('Error fetching daily usage data:', dailyError);
          // Continue with other queries
        }
        
        // Process daily data
        const dailyUsage = [];
        if (dailyData) {
          // Group by day
          const groupedByDay = dailyData.reduce((acc: Record<string, number>, item) => {
            const date = new Date(item.created_at).toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
          }, {});
          
          // Convert to array format for charts
          for (const [date, count] of Object.entries(groupedByDay)) {
            dailyUsage.push({
              time_period: date,
              requests: count
            });
          }
        }
        
        // 2. Get endpoint usage
        const { data: endpointData, error: endpointError } = await supabase
          .from('developer_api_usage')
          .select('endpoint, count(*)')
          .eq('app_id', appId)
          .gte('created_at', `now() - interval '${timeInterval}'`)
          .group('endpoint')
          .order('count', { ascending: false });
          
        if (endpointError) {
          console.error('Error fetching endpoint data:', endpointError);
          // Continue with other queries
        }
        
        // Format endpoint data
        const endpointUsage = endpointData ? endpointData.map(item => ({
          endpoint: item.endpoint,
          requests: item.count
        })) : [];
        
        // 3. Get status code distribution
        const { data: statusData, error: statusError } = await supabase
          .from('developer_api_usage')
          .select('response_status, count(*)')
          .eq('app_id', appId)
          .gte('created_at', `now() - interval '${timeInterval}'`)
          .group('response_status')
          .order('response_status', { ascending: true });
          
        if (statusError) {
          console.error('Error fetching status data:', statusError);
          // Continue with other queries
        }
        
        // Format status data
        const statusUsage = statusData ? statusData.map(item => ({
          status_code: item.response_status,
          count: item.count
        })) : [];
        
        // 4. Get summary statistics
        const { data: summaryData, error: summaryError } = await supabase
          .rpc('api_usage_summary', { app_id_param: appId, time_interval: timeInterval });
          
        if (summaryError) {
          console.error('Error fetching summary data:', summaryError);
          // Use defaults
        }
        
        // Format summary data
        const summary = summaryData || {
          total_requests: 0,
          success_count: 0,
          error_count: 0,
          avg_response_time: 0
        };
        
        // Combine all data
        const usageData = {
          daily: dailyUsage,
          by_endpoint: endpointUsage,
          by_status: statusUsage,
          summary
        };
        
        return new Response(
          JSON.stringify(createSuccessResponse(usageData)),
          {
            status: 200,
            headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      case 'api-quota': {
        const appId = url.searchParams.get('app_id');
        
        if (!appId) {
          return new Response(
            JSON.stringify(createErrorResponse(
              'invalid_request', 
              'app_id parameter is required'
            )),
            {
              status: 400,
              headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
        
        // Verify app ownership
        const { data: app, error: appError } = await supabase
          .from('developer_apps')
          .select('id, monthly_request_limit')
          .eq('id', appId)
          .eq('user_id', user.id)
          .single();
          
        if (appError || !app) {
          return new Response(
            JSON.stringify(createErrorResponse(
              'not_found', 
              'App not found or does not belong to the user'
            )),
            {
              status: 404,
              headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
        
        // Get current month's usage
        const { data: usageCount, error: usageError } = await supabase
          .from('developer_api_usage')
          .select('count(*)')
          .eq('app_id', appId)
          .gte('created_at', 'date_trunc(\'month\', now())')
          .single();
          
        if (usageError) {
          console.error('Error fetching usage count:', usageError);
          // Use default
        }
        
        // Calculate next reset date (first day of next month)
        const today = new Date();
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        
        // Format quota data
        const quotaData = {
          used: usageCount?.count || 0,
          limit: app.monthly_request_limit,
          reset_date: nextMonth.toISOString()
        };
        
        return new Response(
          JSON.stringify(createSuccessResponse(quotaData)),
          {
            status: 200,
            headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      default:
        return new Response(
          JSON.stringify(createErrorResponse(
            'invalid_request', 
            'Unknown analytics type'
          )),
          {
            status: 400,
            headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
          }
        );
    }
  } catch (error) {
    console.error('Error in analytics endpoint:', error);
    
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
