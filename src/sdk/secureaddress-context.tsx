import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SecureAddressBridge } from './secureaddress-bridge-sdk';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface WalletInfo {
  address: string;
  chainId: string;
  connectedAt: string;
}

interface SecureAddressContextType {
  client: SecureAddressBridge | null;
  isAuthorized: boolean;
  isLoading: boolean;
  error: string | null;
  zkpProof: any | null;
  address: any | null;
  walletLinked: boolean;
  user: any | null;
  sdk: SecureAddressBridge | null;
  isAuthenticated: boolean;
  wallets: WalletInfo[];
  refreshWallets: () => Promise<void>;
  authorizeAddress: (options?: any) => Promise<void>;
  authorizeZkp: (options: any) => Promise<void>;
  getAddress: () => Promise<any>;
  getZkProof: () => Promise<any>;
  verifyWallet: (options: any) => Promise<any>;
  linkWalletToAddress: (options: any) => Promise<any>;
  logout: () => void;
}

const SecureAddressContext = createContext<SecureAddressContextType | undefined>(undefined);

interface SecureAddressProviderProps {
  children: ReactNode;
  appId: string;
  apiUrl?: string;
  redirectUri?: string;
}

export const SecureAddressProvider: React.FC<SecureAddressProviderProps> = ({
  children,
  appId,
  apiUrl,
  redirectUri,
}) => {
  const [client, setClient] = useState<SecureAddressBridge | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [zkpProof, setZkpProof] = useState<any | null>(null);
  const [address, setAddress] = useState<any | null>(null);
  const [walletLinked, setWalletLinked] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const secureAddressClient = new SecureAddressBridge({
      appId,
      apiUrl,
      redirectUri,
    });
    setClient(secureAddressClient);

    const storedToken = localStorage.getItem('secureaddress_token');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthorized(true);
      setIsAuthenticated(true);

      fetchUserInfo(storedToken);
    }

    const proofId = localStorage.getItem('secureaddress_proof_id');
    const proofToken = localStorage.getItem('secureaddress_proof_token');
    if (proofId && proofToken) {
      secureAddressClient.getZkProof()
        .then(result => {
          if (result.success && result.proof) {
            setZkpProof(result.proof);
          }
        })
        .catch(err => {
          console.error('Error loading ZK proof:', err);
        });
    }

    setIsLoading(false);
  }, [appId, apiUrl, redirectUri]);

  const fetchUserInfo = async (token: string) => {
    try {
      setUser({
        id: 'user-123',
        email: 'user@example.com'
      });

      await refreshWallets();
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const refreshWallets = async () => {
    try {
      if (isAuthenticated) {
        setWallets([
          {
            address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
            chainId: '0x1',
            connectedAt: new Date().toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error('Error refreshing wallets:', error);
    }
  };

  useEffect(() => {
    if (!client) return;

    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const proofId = url.searchParams.get('proof_id');

    if (code) {
      handleAuthCallback();
    }

    if (proofId) {
      handleZkpCallback();
    }
  }, [client]);

  const handleAuthCallback = async () => {
    if (!client) return;

    try {
      setIsLoading(true);
      const result = await client.handleCallback();
      if (result.success && result.token) {
        localStorage.setItem('secureaddress_token', result.token);
        setToken(result.token);
        setIsAuthorized(true);
        setIsAuthenticated(true);
      } else {
        setError(result.error || 'Authorization failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleZkpCallback = async () => {
    if (!client) return;

    try {
      setIsLoading(true);
      const result = await client.handleZkpCallback();
      if (result.success) {
        const proofResult = await client.getZkProof();
        if (proofResult.success && proofResult.proof) {
          setZkpProof(proofResult.proof);
        }
      } else {
        setError(result.error || 'ZKP authorization failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const authorizeAddress = async (options = {}) => {
    if (!client) throw new Error('Client not initialized');
    
    await client.authorize({
      redirectUri: redirectUri,
      ...options,
    });
  };

  const authorizeZkp = async (options: any) => {
    if (!client) throw new Error('Client not initialized');
    
    await client.authorizeZkp({
      redirectUri: redirectUri,
      ...options,
    });
  };

  const getAddress = async () => {
    if (!client || !token) {
      throw new Error('Client not initialized or not authorized');
    }

    try {
      const result = await client.getAddress(token);
      if (result.success && result.address) {
        setAddress(result.address);
        return result.address;
      } else {
        throw new Error(result.error || 'Failed to get address');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const getZkProof = async () => {
    if (!client) {
      throw new Error('Client not initialized');
    }

    try {
      const result = await client.getZkProof();
      if (result.success && result.proof) {
        setZkpProof(result.proof);
        return result.proof;
      } else {
        throw new Error(result.error || 'Failed to get ZK proof');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const verifyWallet = async (options: any) => {
    if (!client) {
      throw new Error('Client not initialized');
    }

    try {
      return await client.verifyWallet(options);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const linkWalletToAddress = async (options: any) => {
    if (!client) {
      throw new Error('Client not initialized');
    }

    try {
      setWalletLinked(true);
      toast.success('Wallet linked successfully');
      
      await refreshWallets();
      
      return { success: true, linked: true };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('secureaddress_token');
    localStorage.removeItem('secureaddress_proof_id');
    localStorage.removeItem('secureaddress_proof_token');
    setToken(null);
    setIsAuthorized(false);
    setIsAuthenticated(false);
    setUser(null);
    setZkpProof(null);
    setAddress(null);
    setWalletLinked(false);
    setWallets([]);
  };

  const value = {
    client,
    isAuthorized,
    isLoading,
    error,
    zkpProof,
    address,
    walletLinked,
    user,
    sdk: client,
    isAuthenticated,
    wallets,
    refreshWallets,
    authorizeAddress,
    authorizeZkp,
    getAddress,
    getZkProof,
    verifyWallet,
    linkWalletToAddress,
    logout,
  };

  return (
    <SecureAddressContext.Provider value={value}>
      {children}
    </SecureAddressContext.Provider>
  );
};

export const useSecureAddress = (): SecureAddressContextType => {
  const context = useContext(SecureAddressContext);
  if (context === undefined) {
    throw new Error('useSecureAddress must be used within a SecureAddressProvider');
  }
  return context;
};
