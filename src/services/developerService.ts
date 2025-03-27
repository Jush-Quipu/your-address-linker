
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Developer role types
export enum DeveloperRole {
  DEVELOPER = 'developer',
  ADMIN = 'admin'
}

// Check if a user has developer access
export const checkDeveloperAccess = async (userId: string): Promise<boolean> => {
  try {
    // For now, all authenticated users have developer access
    // In a production environment, this would check against a developer_roles table
    return true;
  } catch (error) {
    console.error('Error checking developer access:', error);
    return false;
  }
};

// Get developer apps for a user
export const getDeveloperApps = async () => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error('Authentication required');
    }

    const { data, error } = await supabase
      .from('developer_apps')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching developer apps:', error);
    toast.error('Failed to load your applications');
    throw error;
  }
};

// Create a new developer app
export const createDeveloperApp = async (appData: {
  appName: string;
  description: string;
  websiteUrl: string;
  callbackUrls: string[];
}) => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error('Authentication required');
    }

    // Generate app ID and secret
    const appId = `app_${Date.now()}`;
    const appSecret = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const { data, error } = await supabase
      .from('developer_apps')
      .insert({
        id: appId,
        user_id: session.session.user.id,
        app_name: appData.appName,
        description: appData.description || null,
        website_url: appData.websiteUrl || null,
        callback_urls: appData.callbackUrls,
        app_secret: appSecret
      })
      .select()
      .single();
      
    if (error) throw error;
    
    toast.success('Application registered successfully', {
      description: 'Your app credentials have been generated'
    });
    
    return data;
  } catch (error) {
    console.error('Error registering application:', error);
    toast.error('Failed to register application', {
      description: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

// Get analytics data for developer apps
export const getDeveloperAnalytics = async (appId?: string) => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error('Authentication required');
    }

    // Build the query for developer_api_usage
    let query = supabase
      .from('developer_api_usage')
      .select('*');
      
    // Filter by app_id if provided
    if (appId) {
      query = query.eq('app_id', appId);
    }
    
    // Execute the query
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(100);
      
    if (error) throw error;
    
    // Process and return the analytics data
    return {
      rawData: data,
      summary: processAnalyticsSummary(data)
    };
  } catch (error) {
    console.error('Error fetching developer analytics:', error);
    toast.error('Failed to load analytics data');
    throw error;
  }
};

// Helper function to process analytics data into a summary
const processAnalyticsSummary = (data: any[]) => {
  if (!data || data.length === 0) {
    return {
      totalRequests: 0,
      averageResponseTime: 0,
      successRate: 0,
      endpointBreakdown: {},
      timeSeriesData: []
    };
  }
  
  // Calculate basic metrics
  const totalRequests = data.length;
  const successfulRequests = data.filter(item => item.response_status >= 200 && item.response_status < 300).length;
  const totalResponseTime = data.reduce((sum, item) => sum + (item.execution_time_ms || 0), 0);
  
  // Compile endpoint breakdown
  const endpointBreakdown: Record<string, number> = {};
  data.forEach(item => {
    const endpoint = item.endpoint || 'unknown';
    endpointBreakdown[endpoint] = (endpointBreakdown[endpoint] || 0) + 1;
  });
  
  // Generate time series data (last 7 days)
  const timeSeriesData = generateTimeSeriesData(data);
  
  return {
    totalRequests,
    averageResponseTime: totalRequests > 0 ? totalResponseTime / totalRequests : 0,
    successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
    endpointBreakdown,
    timeSeriesData
  };
};

// Helper function to generate time series data
const generateTimeSeriesData = (data: any[]) => {
  // Create a 7-day window
  const result = [];
  const now = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const count = data.filter(item => {
      const itemDate = new Date(item.created_at);
      return itemDate >= date && itemDate < nextDate;
    }).length;
    
    result.push({
      date: date.toISOString().split('T')[0],
      count
    });
  }
  
  return result;
};
