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

export type ShippingPermission = AccessPermission & {
  isShippingCarrier: boolean;
  allowedCarriers: string[];
  blindShippingEnabled: boolean;
  allowedShippingMethods: string[];
  requireDeliveryConfirmation: boolean;
};

export const createAccessPermission = async (permission: Omit<AccessPermission, 'accessToken'>): Promise<string> => {
  try {
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

export const createBlindShippingPermission = async (
  permission: Omit<ShippingPermission, 'accessToken'>
): Promise<string> => {
  try {
    const accessToken = 'ship_' + generateAccessToken();
    
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
        access_notification: permission.accessNotification || true,
        access_count: 0,
        revoked: false,
        metadata: {
          isShippingCarrier: permission.isShippingCarrier,
          allowedCarriers: permission.allowedCarriers,
          blindShippingEnabled: permission.blindShippingEnabled,
          allowedShippingMethods: permission.allowedShippingMethods,
          requireDeliveryConfirmation: permission.requireDeliveryConfirmation
        }
      }])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating shipping permission:', error);
      throw error;
    }
    
    return accessToken;
  } catch (error) {
    console.error('Error in createBlindShippingPermission:', error);
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
    
    const validityCheck = await checkPermissionValidity(data.id);
    
    if (!validityCheck.isValid) {
      console.error(`Access token invalid: ${validityCheck.reason}`);
      return null;
    }
    
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
    const permission = await validateAccessToken(accessToken);
    
    if (!permission) {
      throw new Error('Invalid or expired access token');
    }
    
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
    
    if (physicalAddress.verification_status !== 'verified') {
      throw new Error('Address has not been verified yet');
    }
    
    await logAddressAccess(permission.id, requestedFields.length > 0 ? requestedFields : null);
    
    if (permission.access_notification) {
      await sendAccessNotification(permission, requestedFields);
    }
    
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

export const getAddressForShippingCarrier = async (
  shipToken: string,
  carrierIdentifier: string,
  carrierApiKey: string,
  shipmentDetails: {
    trackingNumber?: string;
    service: string;
    packageType: string;
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    }
  }
): Promise<any> => {
  try {
    const permission = await validateAccessToken(shipToken);
    
    if (!permission) {
      throw new Error('Invalid or expired shipping token');
    }
    
    const metadata = permission.metadata || {};
    if (!metadata.isShippingCarrier) {
      throw new Error('This token is not authorized for shipping carrier access');
    }
    
    if (!metadata.allowedCarriers.includes(carrierIdentifier)) {
      throw new Error(`Carrier ${carrierIdentifier} is not authorized for this token`);
    }
    
    if (!metadata.allowedShippingMethods.includes(shipmentDetails.service)) {
      throw new Error(`Shipping service ${shipmentDetails.service} is not authorized for this token`);
    }
    
    const { data: physicalAddress, error } = await supabase
      .from('physical_addresses')
      .select('*')
      .eq('user_id', permission.user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error || !physicalAddress) {
      throw new Error('Address not found or cannot be accessed');
    }
    
    await logAddressAccess(permission.id, ['carrier_access', carrierIdentifier, shipmentDetails.service]);
    
    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .insert([{
        permission_id: permission.id,
        carrier: carrierIdentifier,
        tracking_number: shipmentDetails.trackingNumber || 'pending',
        service: shipmentDetails.service,
        status: 'created',
        user_id: permission.user_id,
        package_details: {
          type: shipmentDetails.packageType,
          weight: shipmentDetails.weight,
          dimensions: shipmentDetails.dimensions
        }
      }])
      .select()
      .single();
      
    if (shipmentError) {
      console.error('Error creating shipment record:', shipmentError);
    }
    
    return {
      recipient_address: {
        street_address: physicalAddress.street_address,
        city: physicalAddress.city,
        state: physicalAddress.state,
        postal_code: physicalAddress.postal_code,
        country: physicalAddress.country
      },
      shipment_id: shipment?.id || 'unknown',
      requires_delivery_confirmation: metadata.requireDeliveryConfirmation || false
    };
  } catch (error) {
    console.error('Error in getAddressForShippingCarrier:', error);
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
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);
    
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

export const createBlindShippingAppPermission = async (
  userId: string,
  appName: string,
  shippingSettings: {
    allowedCarriers: string[];
    allowedShippingMethods: string[];
    requireDeliveryConfirmation: boolean;
  },
  expiryDays: number = 7,
  maxAccesses: number | null = 1,
  enableNotifications: boolean = true
): Promise<string> => {
  try {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);
    
    const appId = `ship_${Date.now()}`;
    
    const accessToken = await createBlindShippingPermission({
      userId,
      appId,
      appName: `${appName} (Shipping)`,
      shareStreet: true,
      shareCity: true,
      shareState: true,
      sharePostalCode: true,
      shareCountry: true,
      accessExpiry: expiryDate.toISOString(),
      maxAccessCount: maxAccesses,
      accessNotification: enableNotifications,
      isShippingCarrier: true,
      allowedCarriers: shippingSettings.allowedCarriers,
      blindShippingEnabled: true,
      allowedShippingMethods: shippingSettings.allowedShippingMethods,
      requireDeliveryConfirmation: shippingSettings.requireDeliveryConfirmation
    });
    
    toast.success('Blind shipping permission granted', {
      description: `Shipping token created for ${appName}`
    });
    
    return accessToken;
  } catch (error) {
    console.error('Error in createBlindShippingAppPermission:', error);
    toast.error('Failed to create shipping permission', {
      description: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

async function sendAccessNotification(
  permission: Tables<'address_permissions'>,
  accessedFields: string[] | null
): Promise<void> {
  try {
    console.log(`[NOTIFICATION] Address accessed by ${permission.app_name}`);
    console.log(`Fields accessed: ${accessedFields ? accessedFields.join(', ') : 'all permitted fields'}`);
    
    await supabase
      .from('address_permissions')
      .update({ last_notification_at: new Date().toISOString() })
      .eq('id', permission.id);
  } catch (error) {
    console.error('Error sending access notification:', error);
  }
}

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
