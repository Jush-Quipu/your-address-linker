
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

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

export const createPhysicalAddress = async (address: Omit<PhysicalAddress, 'id' | 'created_at' | 'updated_at'>): Promise<PhysicalAddress> => {
  const { data, error } = await supabase
    .from('physical_addresses')
    .insert([address])
    .select()
    .single();
    
  if (error) {
    console.error('Error creating physical address:', error);
    throw error;
  }
  
  return data;
};

export const updatePhysicalAddress = async (id: string, updates: Partial<PhysicalAddress>): Promise<PhysicalAddress> => {
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
  
  return data;
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
