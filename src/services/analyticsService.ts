import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ApiUsageSummary {
  total_requests: number;
  success_count: number;
  error_count: number;
  avg_response_time: number;
}

export interface ApiUsageByTime {
  time_period: string;
  requests: number;
}

export interface ApiUsageByEndpoint {
  endpoint: string;
  requests: number;
}

export interface ApiUsageByStatus {
  status_code: number;
  count: number;
}

export interface ApiUsageDetails {
  daily: ApiUsageByTime[];
  by_endpoint: ApiUsageByEndpoint[];
  by_status: ApiUsageByStatus[];
  summary: ApiUsageSummary;
}

// Function to get API usage for a specific app
export const getApiUsage = async (appId: string, timeRange: string = '7d'): Promise<ApiUsageDetails> => {
  try {
    const { data: token } = await supabase.auth.getSession();
    if (!token.session) {
      throw new Error('Authentication required');
    }

    const supabaseUrl = process.env.SUPABASE_URL || supabase.getUrl();
    
    const url = new URL(`${supabaseUrl}/functions/v1/analytics/api-usage`);
    url.searchParams.append('app_id', appId);
    url.searchParams.append('time_range', timeRange);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.session.access_token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch API usage data');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching API usage:', error);
    toast.error('Failed to fetch API usage data', {
      description: error instanceof Error ? error.message : 'Unknown error occurred'
    });
    throw error;
  }
};

// Function to track a client-side API request
export const trackApiRequest = (endpoint: string, method: string, status: number, timeMs: number) => {
  // This is just tracking in local storage for demo purposes
  // In a real app, we might queue these and batch send them to the server
  try {
    const existingLogs = JSON.parse(localStorage.getItem('api_tracking_logs') || '[]');
    existingLogs.push({
      endpoint,
      method,
      status,
      execution_time_ms: timeMs,
      timestamp: new Date().toISOString()
    });
    // Keep only the latest 100 logs
    const trimmedLogs = existingLogs.slice(-100);
    localStorage.setItem('api_tracking_logs', JSON.stringify(trimmedLogs));
  } catch (error) {
    console.error('Error tracking API request:', error);
  }
};

// Function to get quota information for an app
export const getApiQuota = async (appId: string): Promise<{ 
  used: number,
  limit: number, 
  reset_date: string
}> => {
  try {
    const { data: token } = await supabase.auth.getSession();
    if (!token.session) {
      throw new Error('Authentication required');
    }

    const supabaseUrl = process.env.SUPABASE_URL || supabase.getUrl();
    
    const url = new URL(`${supabaseUrl}/functions/v1/analytics/api-quota`);
    url.searchParams.append('app_id', appId);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.session.access_token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch API quota data');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching API quota:', error);
    toast.error('Failed to fetch API quota data', {
      description: error instanceof Error ? error.message : 'Unknown error occurred'
    });
    throw error;
  }
};
