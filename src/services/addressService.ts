import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { importPublicKey, encryptAddress, getActiveEncryptionKey, createAndStoreEncryptionKey } from './encryptionService';
import { generateAddressProof } from './zkpService';

export type PhysicalAddress = Tables<'physical_addresses'>;
export type WalletAddress = Tables<'wallet_addresses'>;
export type AddressPermission = Tables<'address_permissions'>;

// Physical Address functions
export const getPhysicalAddresses = async (): Promise<PhysicalAddress[]> => {
  const { data, error } = await supabase
    .from('physical_addresses')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching physical addresses:', error);
    throw error;
  }
  
  return data || [];
};

export const getPhysicalAddressById = async (id: string): Promise<PhysicalAddress | null> => {
  const { data, error } = await supabase
    .from('physical_addresses')
    .select('*')
    .eq('id', id)
    .maybeSingle();
    
  if (error) {
    console.error('Error fetching physical address:', error);
    throw error;
  }
  
  return data;
};

export const createPhysicalAddress = async (
  address: Omit<PhysicalAddress, 'id' | 'created_at' | 'updated_at'>
): Promise<PhysicalAddress> => {
  try {
    let encryptionKey = await getActiveEncryptionKey(address.user_id);
    
    if (!encryptionKey) {
      encryptionKey = await createAndStoreEncryptionKey(address.user_id);
    }
    
    const publicKey = await importPublicKey(encryptionKey.public_key);
    
    const encryptedAddressData = await encryptAddress(publicKey, {
      street_address: address.street_address,
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country
    });
    
    const zkpData = await generateAddressProof(
      'new_address',
      {
        street_address: address.street_address,
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        country: address.country
      }
    );
    
    const addressWithEncryption = {
      ...address,
      encryption_public_key: encryptionKey.public_key,
      encryption_version: 1,
      ...encryptedAddressData,
      zkp_proof: zkpData.proof,
      zkp_public_inputs: zkpData.public_inputs,
      zkp_created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('physical_addresses')
      .insert([addressWithEncryption])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating physical address:', error);
      throw error;
    }
    
    toast.success('Address created with encryption', {
      description: 'Your address data is now stored securely'
    });
    
    return data;
  } catch (error) {
    console.error('Error in createPhysicalAddress:', error);
    toast.error('Failed to create address', {
      description: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

export const updatePhysicalAddress = async (id: string, updates: Partial<PhysicalAddress>): Promise<PhysicalAddress> => {
  try {
    const { data: currentAddress, error: fetchError } = await supabase
      .from('physical_addresses')
      .select('user_id')
      .eq('id', id)
      .single();
      
    if (fetchError || !currentAddress) {
      console.error('Error fetching address to update:', fetchError);
      throw fetchError || new Error('Address not found');
    }
    
    const userId = currentAddress.user_id;
    
    if (
      updates.street_address !== undefined ||
      updates.city !== undefined ||
      updates.state !== undefined ||
      updates.postal_code !== undefined ||
      updates.country !== undefined
    ) {
      const { data: fullAddress, error: fullAddressError } = await supabase
        .from('physical_addresses')
        .select('street_address, city, state, postal_code, country')
        .eq('id', id)
        .single();
        
      if (fullAddressError || !fullAddress) {
        console.error('Error fetching full address data:', fullAddressError);
        throw fullAddressError || new Error('Full address data not found');
      }
      
      const updatedAddressData = {
        street_address: updates.street_address || fullAddress.street_address,
        city: updates.city || fullAddress.city,
        state: updates.state || fullAddress.state,
        postal_code: updates.postal_code || fullAddress.postal_code,
        country: updates.country || fullAddress.country
      };
      
      const encryptionKey = await getActiveEncryptionKey(userId);
      
      if (!encryptionKey) {
        throw new Error('No encryption key found for user');
      }
      
      const publicKey = await importPublicKey(encryptionKey.public_key);
      
      const encryptedAddressData = await encryptAddress(publicKey, updatedAddressData);
      
      const zkpData = await generateAddressProof(
        id,
        updatedAddressData
      );
      
      updates = {
        ...updates,
        ...encryptedAddressData,
        encryption_public_key: encryptionKey.public_key,
        encryption_version: 1,
        zkp_proof: zkpData.proof,
        zkp_public_inputs: zkpData.public_inputs,
        zkp_created_at: new Date().toISOString()
      };
    }
    
    const { data, error } = await supabase
      .from('physical_addresses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating physical address:', error);
      throw error;
    }
    
    toast.success('Address updated successfully', {
      description: 'Your address data has been securely updated'
    });
    
    return data;
  } catch (error) {
    console.error('Error in updatePhysicalAddress:', error);
    toast.error('Failed to update address', {
      description: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

// Wallet Address functions
export const getWalletAddresses = async (): Promise<WalletAddress[]> => {
  const { data, error } = await supabase
    .from('wallet_addresses')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching wallet addresses:', error);
    throw error;
  }
  
  return data || [];
};

export const getWalletAddressById = async (id: string): Promise<WalletAddress | null> => {
  const { data, error } = await supabase
    .from('wallet_addresses')
    .select('*')
    .eq('id', id)
    .maybeSingle();
    
  if (error) {
    console.error('Error fetching wallet address:', error);
    throw error;
  }
  
  return data;
};

export const createWalletAddress = async (walletAddress: Omit<WalletAddress, 'id' | 'created_at' | 'updated_at'>): Promise<WalletAddress> => {
  const { data, error } = await supabase
    .from('wallet_addresses')
    .insert([walletAddress])
    .select()
    .single();
    
  if (error) {
    console.error('Error creating wallet address:', error);
    throw error;
  }
  
  return data;
};

export const updateWalletAddress = async (id: string, updates: Partial<WalletAddress>): Promise<WalletAddress> => {
  const { data, error } = await supabase
    .from('wallet_addresses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating wallet address:', error);
    throw error;
  }
  
  return data;
};

// Address Permissions functions
export const getAddressPermissions = async (): Promise<AddressPermission[]> => {
  const { data, error } = await supabase
    .from('address_permissions')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching address permissions:', error);
    throw error;
  }
  
  return data || [];
};

export const createAddressPermission = async (permission: Omit<AddressPermission, 'id' | 'created_at' | 'updated_at'>): Promise<AddressPermission> => {
  const { data, error } = await supabase
    .from('address_permissions')
    .insert([permission])
    .select()
    .single();
    
  if (error) {
    console.error('Error creating address permission:', error);
    throw error;
  }
  
  return data;
};

export const updateAddressPermission = async (id: string, updates: Partial<AddressPermission>): Promise<AddressPermission> => {
  const { data, error } = await supabase
    .from('address_permissions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating address permission:', error);
    throw error;
  }
  
  return data;
};

export const deleteAddressPermission = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('address_permissions')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting address permission:', error);
    throw error;
  }
};

export const logAddressAccess = async (permissionId: string, accessedFields: string[] | null = null): Promise<void> => {
  const { error } = await supabase
    .from('access_logs')
    .insert([{
      permission_id: permissionId,
      accessed_fields: accessedFields,
      ip_address: window.location.hostname,
      user_agent: navigator.userAgent
    }]);
    
  if (error) {
    console.error('Error logging access:', error);
    // Don't throw here to avoid disrupting the user experience
    // Just log the error
  }
};

// Fix type issue in increment counter function
export const incrementAccessCount = async (permissionId: string): Promise<void> => {
  try {
    const { error } = await (supabase.rpc as any)(
      'increment_counter', 
      { 
        row_id: permissionId
      }
    );
    
    if (error) {
      console.error('Error incrementing access count:', error);
    } else {
      await supabase
        .from('address_permissions')
        .update({ 
          last_accessed: new Date().toISOString() 
        })
        .eq('id', permissionId);
    }
  } catch (error) {
    console.error('Error in incrementAccessCount:', error);
  }
};

// Export the getAccessLogs function that is used in Dashboard.tsx
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

// New function to check if an address permission has expired
export const checkPermissionValidity = async (permissionId: string): Promise<{
  isValid: boolean;
  reason?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from('address_permissions')
      .select('access_expiry, revoked, max_access_count, access_count')
      .eq('id', permissionId)
      .single();
      
    if (error || !data) {
      console.error('Error checking permission validity:', error);
      return { isValid: false, reason: 'Permission not found' };
    }
    
    if (data.revoked) {
      return { isValid: false, reason: 'Permission has been revoked' };
    }
    
    if (data.access_expiry && new Date(data.access_expiry) < new Date()) {
      return { isValid: false, reason: 'Permission has expired' };
    }
    
    if (data.max_access_count !== null && data.access_count >= data.max_access_count) {
      return { isValid: false, reason: 'Maximum access count reached' };
    }
    
    return { isValid: true };
  } catch (error) {
    console.error('Error in checkPermissionValidity:', error);
    return { isValid: false, reason: 'Error checking permission validity' };
  }
};

// New function to revoke a permission
export const revokePermission = async (
  permissionId: string, 
  reason: string = 'Revoked by user'
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('address_permissions')
      .update({ 
        revoked: true,
        revoked_at: new Date().toISOString(),
        revocation_reason: reason
      })
      .eq('id', permissionId);
      
    if (error) {
      console.error('Error revoking permission:', error);
      throw error;
    }
    
    toast.success('Permission revoked successfully');
  } catch (error) {
    console.error('Error in revokePermission:', error);
    toast.error('Failed to revoke permission', {
      description: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};
