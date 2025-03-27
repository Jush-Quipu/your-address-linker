
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define types for the SDK
export interface SecureAddressUserProfile {
  userId: string;
  walletAddress?: string;
  emailVerified?: boolean;
  verifiedAddresses?: boolean;
}

export interface AddressData {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  verified: boolean;
  verificationMethod?: string;
  verificationDate?: string;
}

export interface WalletData {
  address: string;
  chainId: string;
  connectedAt: string;
}

export interface PermissionRequest {
  appId: string;
  requesterName: string;
  requestedFields: string[];
  purpose: string;
  expiryDays?: number;
}

export interface PermissionGrant {
  id: string;
  grantedAt: string;
  expiresAt: string;
  fields: string[];
  usageCount: number;
  maxUsages?: number;
}

// Core SDK Class
export class SecureAddressBridge {
  private apiKey?: string;
  private user?: any;
  private sandboxMode: boolean;

  constructor(config: { apiKey?: string; sandboxMode?: boolean }) {
    this.apiKey = config.apiKey;
    this.sandboxMode = config.sandboxMode || false;
  }

  // User authentication integration with both Web2 and Web3
  async loginWithEmail(email: string, password: string): Promise<{ success: boolean; error?: string; user?: any }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      this.user = data.user;
      return { success: true, user: data.user };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }

  async signUpWithEmail(email: string, password: string): Promise<{ success: boolean; error?: string; user?: any }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      return { success: true, user: data.user };
    } catch (error: any) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    }
  }

  // Web3 wallet connection functionality
  async connectWallet(providerType: string = 'injected'): Promise<{ success: boolean; error?: string; address?: string }> {
    try {
      // Check if we're in sandbox mode
      if (this.sandboxMode) {
        return {
          success: true,
          address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
        };
      }

      // In real implementation, this would connect to an actual web3 provider
      // and handle the connection logic based on the provider type
      if (!window.ethereum && providerType === 'injected') {
        throw new Error('No Ethereum provider found. Please install MetaMask or use WalletConnect.');
      }

      // For this implementation, we'll mock a wallet connection
      return {
        success: true,
        address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F" // Mock address for demonstration
      };
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      return { success: false, error: error.message };
    }
  }

  // Address verification and management
  async addAddress(addressData: AddressData): Promise<{ success: boolean; error?: string; addressId?: string }> {
    try {
      // Check if the user is authenticated
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('User not authenticated');
      }

      // Insert the address into the database
      const { data, error } = await supabase
        .from('physical_addresses')
        .insert({
          user_id: session.session.user.id,
          street_address: addressData.street,
          city: addressData.city,
          state: addressData.state,
          postal_code: addressData.postalCode,
          country: addressData.country,
          verification_status: 'unverified'
        })
        .select()
        .single();

      if (error) throw error;

      return { 
        success: true, 
        addressId: data.id 
      };
    } catch (error: any) {
      console.error('Error adding address:', error);
      return { success: false, error: error.message };
    }
  }

  async verifyAddressWithDocument(addressId: string, documentFile: File): Promise<{ success: boolean; error?: string }> {
    try {
      // Upload the document for verification
      const fileName = `verification_docs/${addressId}/${Date.now()}_${documentFile.name}`;
      
      // This would typically upload to a storage service
      // For demonstration, we'll simulate success
      
      // Get the current user's session
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('User not authenticated');
      }
      
      // Update the verification status in the database
      const { error } = await supabase
        .from('physical_addresses')
        .update({
          verification_status: 'pending',
          verification_method: 'document_upload',
        })
        .eq('id', addressId);

      if (error) throw error;

      // Log the verification attempt - now including the user_id
      await supabase
        .from('address_verification_logs')
        .insert({
          physical_address_id: addressId,
          verification_type: 'document_upload',
          document_type: documentFile.type,
          status: 'pending',
          user_id: session.session.user.id, // Important: Add the user_id
          metadata: { 
            file_name: documentFile.name,
            file_size: documentFile.size,
            file_type: documentFile.type
          }
        });

      return { success: true };
    } catch (error: any) {
      console.error('Error verifying address:', error);
      return { success: false, error: error.message };
    }
  }

  // Linking addresses with wallets using zero-knowledge proofs
  async linkAddressToWallet(addressId: string, walletAddress: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if the user is authenticated
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('User not authenticated');
      }

      // Verify the user owns the address
      const { data: addressData, error: addressError } = await supabase
        .from('physical_addresses')
        .select('*')
        .eq('id', addressId)
        .eq('user_id', session.session.user.id)
        .single();

      if (addressError || !addressData) {
        throw new Error('Address not found or not owned by user');
      }

      // Check if address is verified
      if (addressData.verification_status !== 'verified') {
        throw new Error('Address must be verified before linking to wallet');
      }

      // Add the wallet to the user's wallets
      const { error: walletError } = await supabase
        .from('wallet_addresses')
        .insert({
          user_id: session.session.user.id,
          address: walletAddress,
          chain_id: 1, // Ethereum mainnet
          is_primary: true
        });

      if (walletError) throw walletError;

      return { success: true };
    } catch (error: any) {
      console.error('Error linking address to wallet:', error);
      return { success: false, error: error.message };
    }
  }

  // Granting / managing permissions for third-party access
  async grantPermission(permission: PermissionRequest): Promise<{ success: boolean; error?: string; permissionId?: string }> {
    try {
      // Check if the user is authenticated
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('User not authenticated');
      }

      // Create a unique access token
      const accessToken = `access_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      // Insert the permission into the database
      const { data, error } = await supabase
        .from('address_permissions')
        .insert({
          user_id: session.session.user.id,
          app_id: permission.appId,
          app_name: permission.requesterName,
          access_token: accessToken,
          share_street: permission.requestedFields.includes('street'),
          share_city: permission.requestedFields.includes('city'),
          share_state: permission.requestedFields.includes('state'),
          share_postal_code: permission.requestedFields.includes('postal_code'),
          share_country: permission.requestedFields.includes('country'),
          access_expiry: permission.expiryDays ? 
            new Date(Date.now() + permission.expiryDays * 24 * 60 * 60 * 1000).toISOString() : 
            null,
          metadata: {
            purpose: permission.purpose,
            requested_at: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Permission granted successfully');
      return { 
        success: true, 
        permissionId: data.id 
      };
    } catch (error: any) {
      console.error('Error granting permission:', error);
      toast.error('Failed to grant permission');
      return { success: false, error: error.message };
    }
  }

  async revokePermission(permissionId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if the user is authenticated
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('User not authenticated');
      }

      // Update the permission in the database
      const { error } = await supabase
        .from('address_permissions')
        .update({
          revoked: true,
          revoked_at: new Date().toISOString(),
          revocation_reason: reason || 'User revoked access'
        })
        .eq('id', permissionId)
        .eq('user_id', session.session.user.id);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error revoking permission:', error);
      return { success: false, error: error.message };
    }
  }

  // Blind shipping functionality
  async createBlindShippingToken(addressId: string, options?: { 
    expiryDays?: number;
    maxUses?: number;
    carriers?: string[];
  }): Promise<{ success: boolean; error?: string; token?: string }> {
    try {
      // Check if the user is authenticated
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('User not authenticated');
      }
      
      // Create a unique shipping token
      const shippingToken = `ship_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      // In real implementation, this would create a blind shipping token
      // that allows merchants to ship without seeing the user's address

      return { 
        success: true, 
        token: shippingToken
      };
    } catch (error: any) {
      console.error('Error creating blind shipping token:', error);
      return { success: false, error: error.message };
    }
  }
}

// React Hook for using the SDK in components
export function useSecureAddress() {
  const [sdk] = useState(new SecureAddressBridge({ sandboxMode: true }));
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const [addresses, setAddresses] = useState<AddressData[]>([]);
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [permissions, setPermissions] = useState<PermissionGrant[]>([]);

  // Initialize and load user data
  useEffect(() => {
    async function loadUserData() {
      try {
        setLoading(true);
        
        // Check if user is already logged in
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setUser(session.user);
          
          // Load user addresses
          const { data: addressData } = await supabase
            .from('physical_addresses')
            .select('*')
            .eq('user_id', session.user.id);
            
          if (addressData) {
            setAddresses(addressData.map(addr => ({
              street: addr.street_address,
              city: addr.city,
              state: addr.state,
              postalCode: addr.postal_code,
              country: addr.country,
              verified: addr.verification_status === 'verified',
              verificationMethod: addr.verification_method,
              verificationDate: addr.verification_date
            })));
          }
          
          // Load user wallets
          const { data: walletData } = await supabase
            .from('wallet_addresses')
            .select('*')
            .eq('user_id', session.user.id);
            
          if (walletData) {
            setWallets(walletData.map(wallet => ({
              address: wallet.address,
              chainId: wallet.chain_id.toString(),
              connectedAt: wallet.created_at
            })));
          }
          
          // Load user permissions
          const { data: permissionData } = await supabase
            .from('address_permissions')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('revoked', false);
            
          if (permissionData) {
            setPermissions(permissionData.map(perm => ({
              id: perm.id,
              grantedAt: perm.created_at,
              expiresAt: perm.access_expiry || '',
              fields: [
                perm.share_street ? 'street' : null,
                perm.share_city ? 'city' : null,
                perm.share_state ? 'state' : null,
                perm.share_postal_code ? 'postal_code' : null,
                perm.share_country ? 'country' : null
              ].filter(Boolean) as string[],
              usageCount: perm.access_count || 0,
              maxUsages: perm.max_access_count
            })));
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadUserData();
    
    // Set up auth subscription to keep user state in sync
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
        // Would reload user data here
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setAddresses([]);
        setWallets([]);
        setPermissions([]);
      }
    });
    
    return () => {
      authListener.subscription?.unsubscribe();
    };
  }, []);

  return {
    sdk,
    user,
    loading,
    addresses,
    wallets,
    permissions,
    isAuthenticated: !!user,
    refreshAddresses: async () => {
      // This would refresh addresses from the database
    },
    refreshWallets: async () => {
      // This would refresh wallets from the database
    },
    refreshPermissions: async () => {
      // This would refresh permissions from the database
    }
  };
}
