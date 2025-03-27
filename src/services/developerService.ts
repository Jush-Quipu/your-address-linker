
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Developer role types
export enum DeveloperRole {
  DEVELOPER = 'developer',
  ADMIN = 'admin'
}

// Define types for the developer_roles table
type DeveloperRoleRecord = {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

// Define app verification status
export enum AppVerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

// Define app status
export enum AppStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DEVELOPMENT = 'development'
}

// Developer app type with extended information
export type DeveloperApp = {
  id: string;
  app_name: string;
  description: string | null;
  website_url: string | null;
  callback_urls: string[];
  app_secret?: string;
  created_at: string;
  updated_at?: string;
  status?: AppStatus;
  verification_status?: AppVerificationStatus;
  monthly_request_limit?: number;
  oauth_settings?: {
    scopes: string[];
    token_lifetime: number;
    refresh_token_rotation: boolean;
  };
  verification_details?: {
    verified_at?: string;
    verified_by?: string;
    verification_notes?: string;
  };
  user_id?: string;
}

// Database representation of developer app
type DeveloperAppRecord = {
  id: string;
  app_name: string;
  description: string | null;
  website_url: string | null;
  callback_urls: string[];
  app_secret: string | null;
  created_at: string;
  user_id: string;
  // Extended attributes stored in a separate table or added as columns to developer_apps
  status?: AppStatus;
  verification_status?: AppVerificationStatus;
  monthly_request_limit?: number;
  oauth_settings?: {
    scopes: string[];
    token_lifetime: number;
    refresh_token_rotation: boolean;
  };
  verification_details?: {
    verified_at?: string;
    verified_by?: string;
    verification_notes?: string;
  };
  updated_at?: string;
}

// Check if a user has developer access
export const checkDeveloperAccess = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('developer_roles')
      .select('*')
      .eq('user_id', userId)
      .in('role', [DeveloperRole.DEVELOPER, DeveloperRole.ADMIN]);
      
    if (error) {
      console.error('Error checking developer roles:', error);
      return false;
    }
    
    return (data && data.length > 0);
  } catch (error) {
    console.error('Error checking developer access:', error);
    return false;
  }
};

// Check if a user has admin access
export const checkAdminAccess = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('developer_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', DeveloperRole.ADMIN);
      
    if (error) {
      console.error('Error checking admin role:', error);
      return false;
    }
    
    return (data && data.length > 0);
  } catch (error) {
    console.error('Error checking admin access:', error);
    return false;
  }
};

// Get user's developer roles
export const getUserRoles = async (userId: string): Promise<DeveloperRole[]> => {
  try {
    const { data, error } = await supabase
      .from('developer_roles')
      .select('*')
      .eq('user_id', userId);
      
    if (error) throw error;
    
    return (data || []).map(record => record.role as DeveloperRole);
  } catch (error) {
    console.error('Error fetching user roles:', error);
    toast.error('Failed to load user roles');
    return [];
  }
};

// Add a role to a user
export const addUserRole = async (userId: string, role: DeveloperRole): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('developer_roles')
      .insert({ user_id: userId, role });
      
    if (error) {
      if (error.code === '23505') { // Unique violation - role already exists
        toast.error('User already has this role');
      } else {
        toast.error('Failed to add role to user');
        console.error('Error adding role:', error);
      }
      return false;
    }
    
    toast.success(`Role ${role} added successfully`);
    return true;
  } catch (error) {
    console.error('Error adding user role:', error);
    toast.error('Failed to add role');
    return false;
  }
};

// Remove a role from a user
export const removeUserRole = async (userId: string, role: DeveloperRole): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('developer_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role);
      
    if (error) {
      toast.error('Failed to remove role from user');
      console.error('Error removing role:', error);
      return false;
    }
    
    toast.success(`Role ${role} removed successfully`);
    return true;
  } catch (error) {
    console.error('Error removing user role:', error);
    toast.error('Failed to remove role');
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
    
    // Enhance the app data with default values for added fields
    const appsWithDefaults = (data || []).map((app: DeveloperAppRecord): DeveloperApp => ({
      ...app,
      status: app.status || AppStatus.DEVELOPMENT,
      verification_status: app.verification_status || AppVerificationStatus.PENDING,
      oauth_settings: app.oauth_settings || {
        scopes: ['read:profile', 'read:address'],
        token_lifetime: 3600,
        refresh_token_rotation: true
      },
      monthly_request_limit: app.monthly_request_limit || 1000
    }));
    
    return appsWithDefaults;
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
  status?: AppStatus;
  oauthSettings?: {
    scopes: string[];
    tokenLifetime: number;
    refreshTokenRotation: boolean;
  };
  requestLimit?: number;
}) => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error('Authentication required');
    }

    const appId = `app_${Date.now()}`;
    const appSecret = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const oauthSettings = appData.oauthSettings ? {
      scopes: appData.oauthSettings.scopes,
      token_lifetime: appData.oauthSettings.tokenLifetime,
      refresh_token_rotation: appData.oauthSettings.refreshTokenRotation
    } : {
      scopes: ['read:profile', 'read:address'],
      token_lifetime: 3600,
      refresh_token_rotation: true
    };
    
    const { data, error } = await supabase
      .from('developer_apps')
      .insert({
        id: appId,
        user_id: session.session.user.id,
        app_name: appData.appName,
        description: appData.description || null,
        website_url: appData.websiteUrl || null,
        callback_urls: appData.callbackUrls,
        app_secret: appSecret,
        status: appData.status || AppStatus.DEVELOPMENT,
        verification_status: AppVerificationStatus.PENDING,
        monthly_request_limit: appData.requestLimit || 1000,
        oauth_settings: oauthSettings
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

// Update developer app
export const updateDeveloperApp = async (appId: string, appData: {
  appName?: string;
  description?: string;
  websiteUrl?: string;
  callbackUrls?: string[];
  status?: AppStatus;
  oauthSettings?: {
    scopes?: string[];
    tokenLifetime?: number;
    refreshTokenRotation?: boolean;
  };
  requestLimit?: number;
}) => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error('Authentication required');
    }

    // Create update object with appropriate field names for the database
    const updateObj: any = {};
    
    if (appData.appName !== undefined) updateObj.app_name = appData.appName;
    if (appData.description !== undefined) updateObj.description = appData.description;
    if (appData.websiteUrl !== undefined) updateObj.website_url = appData.websiteUrl;
    if (appData.callbackUrls !== undefined) updateObj.callback_urls = appData.callbackUrls;
    if (appData.status !== undefined) updateObj.status = appData.status;
    if (appData.requestLimit !== undefined) updateObj.monthly_request_limit = appData.requestLimit;
    
    if (appData.oauthSettings) {
      try {
        // Get the current app details first to merge with new settings
        const { data: appDetails } = await supabase
          .from('developer_apps')
          .select('*')
          .eq('id', appId)
          .single();
          
        const currentOAuthSettings = appDetails.oauth_settings || {
          scopes: ['read:profile', 'read:address'],
          token_lifetime: 3600,
          refresh_token_rotation: true
        };
        
        updateObj.oauth_settings = {
          ...currentOAuthSettings,
          ...appData.oauthSettings
        };
      } catch (error) {
        console.error('Error fetching current OAuth settings:', error);
        updateObj.oauth_settings = {
          scopes: appData.oauthSettings.scopes || ['read:profile', 'read:address'],
          token_lifetime: appData.oauthSettings.tokenLifetime || 3600,
          refresh_token_rotation: appData.oauthSettings.refreshTokenRotation !== undefined 
            ? appData.oauthSettings.refreshTokenRotation 
            : true
        };
      }
    }
    
    updateObj.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('developer_apps')
      .update(updateObj)
      .eq('id', appId)
      .eq('user_id', session.session.user.id)
      .select()
      .single();
      
    if (error) throw error;
    
    toast.success('Application updated successfully');
    
    return data;
  } catch (error) {
    console.error('Error updating application:', error);
    toast.error('Failed to update application', {
      description: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

// Rotate app secret
export const rotateAppSecret = async (appId: string) => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error('Authentication required');
    }

    const newAppSecret = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const { data, error } = await supabase
      .from('developer_apps')
      .update({ 
        app_secret: newAppSecret,
        updated_at: new Date().toISOString()
      })
      .eq('id', appId)
      .eq('user_id', session.session.user.id)
      .select()
      .single();
      
    if (error) throw error;
    
    toast.success('Application secret rotated successfully', {
      description: 'Save this secret, it will not be shown again'
    });
    
    return data;
  } catch (error) {
    console.error('Error rotating application secret:', error);
    toast.error('Failed to rotate application secret', {
      description: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

// Set app verification status (admin function)
export const setAppVerificationStatus = async (appId: string, status: AppVerificationStatus, notes?: string) => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error('Authentication required');
    }

    const isAdmin = await checkAdminAccess(session.session.user.id);
    if (!isAdmin) {
      throw new Error('Admin access required');
    }
    
    // Create an update object with the verification status and details
    const updateData: any = { 
      verification_status: status,
      verification_details: {
        verified_at: new Date().toISOString(),
        verified_by: session.session.user.id,
        verification_notes: notes || ''
      },
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('developer_apps')
      .update(updateData)
      .eq('id', appId)
      .select()
      .single();
      
    if (error) throw error;
    
    toast.success(`Application ${status === AppVerificationStatus.VERIFIED ? 'verified' : 'updated'} successfully`);
    
    return data;
  } catch (error) {
    console.error('Error updating application verification status:', error);
    toast.error('Failed to update application verification status', {
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

    let query = supabase
      .from('developer_api_usage')
      .select('*');
      
    if (appId) {
      query = query.eq('app_id', appId);
    }
    
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(100);
      
    if (error) throw error;
    
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
  
  const totalRequests = data.length;
  const successfulRequests = data.filter(item => item.response_status >= 200 && item.response_status < 300).length;
  const totalResponseTime = data.reduce((sum, item) => sum + (item.execution_time_ms || 0), 0);
  
  const endpointBreakdown: Record<string, number> = {};
  data.forEach(item => {
    const endpoint = item.endpoint || 'unknown';
    endpointBreakdown[endpoint] = (endpointBreakdown[endpoint] || 0) + 1;
  });
  
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
