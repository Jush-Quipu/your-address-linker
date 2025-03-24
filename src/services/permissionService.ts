
import { supabase } from '@/integrations/supabase/client';
import { generateAccessToken } from '@/utils/auth-helpers';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { checkPermissionValidity, incrementAccessCount, logAddressAccess } from './addressService';

export type AccessPermission = {
  appId: string;
  appName: string;
  userId: string;
  accessToken: string;
  shareStreet: boolean;
  shareCity: boolean;
  shareState: boolean;
  sharePostalCode: boolean;
  shareCountry: boolean;
  accessExpiry?: string | null;
  maxAccessCount?: number | null;
  accessNotification?: boolean;
};

export const createAccessPermission = async (permission: Omit<AccessPermission, 'accessToken'>): Promise<string> => {
  try {
    // Generate a secure access token
    const accessToken = generateAccessToken();
    
    const { data, error } = await supabase
      .from('address_permissions')
      .insert([{
        user_id: permission.userId,
        app_id: permission.appId,
        app_name: permission.appName,
        access_token: accessToken,
        share_street: permission.shareStreet,
        share_city: permission.shareCity,
        share_state: permission.shareState,
        share_postal_code: permission.sharePostalCode,
        share_country: permission.shareCountry,
        access_expiry: permission.accessExpiry || null,
        max_access_count: permission.maxAccessCount || null,
        access_notification: permission.accessNotification || false,
        access_count: 0,
        revoked: false
      }])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating permission:', error);
      throw error;
    }
    
    return accessToken;
  } catch (error) {
    console.error('Error in createAccessPermission:', error);
    throw error;
  }
};

export const validateAccessToken = async (accessToken: string): Promise<Tables<'address_permissions'> | null> => {
  try {
    const { data, error } = await supabase
      .from('address_permissions')
      .select('*')
      .eq('access_token', accessToken)
      .maybeSingle();
      
    if (error) {
      console.error('Error validating token:', error);
      return null;
    }
    
    if (!data) {
      console.error('Invalid access token');
      return null;
    }
    
    // Enhanced permission validation
    const validityCheck = await checkPermissionValidity(data.id);
    
    if (!validityCheck.isValid) {
      console.error(`Access token invalid: ${validityCheck.reason}`);
      return null;
    }
    
    // Increment access count
    await incrementAccessCount(data.id);
    
    return data;
  } catch (error) {
    console.error('Error in validateAccessToken:', error);
    return null;
  }
};

export const getAddressForToken = async (
  accessToken: string, 
  requestedFields: string[] = []
): Promise<any> => {
  try {
    // Validate the token
    const permission = await validateAccessToken(accessToken);
    
    if (!permission) {
      throw new Error('Invalid or expired access token');
    }
    
    // Get the user's physical address
    const { data: physicalAddress, error } = await supabase
      .from('physical_addresses')
      .select('*')
      .eq('user_id', permission.user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error) {
      throw error;
    }
    
    if (!physicalAddress) {
      throw new Error('No address found for this user');
    }
    
    // Check verification status
    if (physicalAddress.verification_status !== 'verified') {
      throw new Error('Address has not been verified yet');
    }
    
    // Log this access with the fields being accessed
    await logAddressAccess(permission.id, requestedFields.length > 0 ? requestedFields : null);
    
    // Send notification if enabled
    if (permission.access_notification) {
      await sendAccessNotification(permission, requestedFields);
    }
    
    // Return only the fields the app is allowed to access
    const allowedAddress: any = {};
    
    if (permission.share_street && (requestedFields.includes('street_address') || requestedFields.length === 0)) {
      allowedAddress.street_address = physicalAddress.street_address;
    }
    
    if (permission.share_city && (requestedFields.includes('city') || requestedFields.length === 0)) {
      allowedAddress.city = physicalAddress.city;
    }
    
    if (permission.share_state && (requestedFields.includes('state') || requestedFields.length === 0)) {
      allowedAddress.state = physicalAddress.state;
    }
    
    if (permission.share_postal_code && (requestedFields.includes('postal_code') || requestedFields.length === 0)) {
      allowedAddress.postal_code = physicalAddress.postal_code;
    }
    
    if (permission.share_country && (requestedFields.includes('country') || requestedFields.length === 0)) {
      allowedAddress.country = physicalAddress.country;
    }
    
    return allowedAddress;
  } catch (error) {
    console.error('Error in getAddressForToken:', error);
    throw error;
  }
};

export const createAppPermission = async (
  userId: string,
  appName: string,
  privacySettings: {
    shareStreet: boolean;
    shareCity: boolean;
    shareState: boolean;
    sharePostalCode: boolean;
    shareCountry: boolean;
  },
  expiryDays: number = 30,
  maxAccesses: number | null = null,
  enableNotifications: boolean = false
): Promise<string> => {
  try {
    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);
    
    // Generate app ID (in a real app, this would be registered)
    const appId = `app_${Date.now()}`;
    
    const accessToken = await createAccessPermission({
      userId,
      appId,
      appName,
      shareStreet: privacySettings.shareStreet,
      shareCity: privacySettings.shareCity,
      shareState: privacySettings.shareState,
      sharePostalCode: privacySettings.sharePostalCode,
      shareCountry: privacySettings.shareCountry,
      accessExpiry: expiryDate.toISOString(),
      maxAccessCount: maxAccesses,
      accessNotification: enableNotifications
    });
    
    toast.success('Permission granted successfully', {
      description: `${appName} can now access your address information`
    });
    
    return accessToken;
  } catch (error) {
    console.error('Error in createAppPermission:', error);
    toast.error('Failed to grant permission', {
      description: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

// Function to send a notification about address access
// This is a mock implementation - in a real app you'd use email, push notifications, etc.
async function sendAccessNotification(
  permission: Tables<'address_permissions'>,
  accessedFields: string[] | null
): Promise<void> {
  try {
    // Mock notification - in a real app, this would send an email or push notification
    console.log(`[NOTIFICATION] Address accessed by ${permission.app_name}`);
    console.log(`Fields accessed: ${accessedFields ? accessedFields.join(', ') : 'all permitted fields'}`);
    
    // Update last notification timestamp
    await supabase
      .from('address_permissions')
      .update({ last_notification_at: new Date().toISOString() })
      .eq('id', permission.id);
    
  } catch (error) {
    console.error('Error sending access notification:', error);
  }
}

// Get access logs for a user
export const getAccessLogs = async (userId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('address_permissions')
      .select(`
        id,
        app_name,
        access_count,
        last_accessed,
        revoked,
        access_logs (*)
      `)
      .eq('user_id', userId)
      .order('last_accessed', { ascending: false });
      
    if (error) {
      console.error('Error fetching access logs:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getAccessLogs:', error);
    throw error;
  }
};
