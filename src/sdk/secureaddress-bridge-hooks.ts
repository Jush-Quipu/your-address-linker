
import { useState, useEffect, useContext, createContext, useCallback, ReactNode } from 'react';
import { SecureAddressBridge } from './secureaddress-bridge-sdk';

// Define the user and wallet types
interface User {
  id: string;
  email?: string;
  name?: string;
  isVerified: boolean;
}

interface Wallet {
  address: string;
  chainId: string;
  network: string;
  connectedAt: string;
}

// Define the context value type
interface SecureAddressContextValue {
  sdk: SecureAddressBridge | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  wallets: Wallet[];
  refreshWallets: () => Promise<void>;
  login: () => Promise<void>;
  logout: () => void;
}

// Create the context
const SecureAddressContext = createContext<SecureAddressContextValue>({
  sdk: null,
  isAuthenticated: false,
  isLoading: true,
  user: null,
  wallets: [],
  refreshWallets: async () => {},
  login: async () => {},
  logout: () => {},
});

// Create the provider component
export const SecureAddressProvider: React.FC<{
  children: ReactNode;
  sdkOptions?: any;
}> = ({ children, sdkOptions }) => {
  const [sdk, setSdk] = useState<SecureAddressBridge | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);

  // Initialize the SDK
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sdkInstance = new SecureAddressBridge({
        appId: 'app_sandbox',
        redirectUri: window.location.origin + '/callback',
        sandbox: true,
        ...(sdkOptions || {})
      });
      
      setSdk(sdkInstance);
      
      // Check if user is already authenticated
      const checkAuth = async () => {
        try {
          // This is a mock implementation since we're in sandbox mode
          // In a real app, you would check for an access token and validate it
          const token = localStorage.getItem('secureaddress_token');
          
          if (token) {
            sdkInstance.setAccessToken(token);
            setIsAuthenticated(true);
            
            // Mock user data
            setUser({
              id: 'user_123',
              email: 'user@example.com',
              name: 'John Doe',
              isVerified: true
            });
            
            // Fetch wallets
            await refreshWallets();
          }
        } catch (error) {
          console.error('Error checking authentication:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      checkAuth();
    }
  }, []);

  // Refresh wallets
  const refreshWallets = useCallback(async () => {
    if (sdk && isAuthenticated) {
      try {
        // Mock implementation - in a real app, you would fetch from API
        setWallets([
          {
            address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
            chainId: '0x1',
            network: 'Ethereum Mainnet',
            connectedAt: new Date().toISOString()
          }
        ]);
      } catch (error) {
        console.error('Error refreshing wallets:', error);
      }
    }
  }, [sdk, isAuthenticated]);

  // Login
  const login = useCallback(async () => {
    if (sdk) {
      try {
        const result = await sdk.authorize({
          scope: ['read:profile', 'read:address', 'write:wallet']
        });
        
        if (result && result.success) {
          const callbackResult = await sdk.handleCallback();
          
          if (callbackResult && callbackResult.success && callbackResult.data) {
            // Store token and set authenticated
            localStorage.setItem('secureaddress_token', callbackResult.data.accessToken);
            sdk.setAccessToken(callbackResult.data.accessToken);
            setIsAuthenticated(true);
            
            // Mock user data
            setUser({
              id: 'user_123',
              email: 'user@example.com',
              name: 'John Doe',
              isVerified: true
            });
            
            // Refresh wallets
            await refreshWallets();
          }
        }
      } catch (error) {
        console.error('Error logging in:', error);
      }
    }
  }, [sdk, refreshWallets]);

  // Logout
  const logout = useCallback(() => {
    if (sdk) {
      // Clear token and state
      localStorage.removeItem('secureaddress_token');
      sdk.setAccessToken(null);
      setIsAuthenticated(false);
      setUser(null);
      setWallets([]);
    }
  }, [sdk]);

  return (
    <SecureAddressContext.Provider
      (value)={{
        sdk
        isAuthenticated,
        isLoading,
        user,
        wallets,
        refreshWallets,
        login,
        logout
      }}
    >
      {children}
    </SecureAddressContext.Provider>
  );
};

// Hook to use the SecureAddress context
export const useSecureAddress = () => {
  const context = useContext(SecureAddressContext);
  
  if (!context) {
    throw new Error('useSecureAddress must be used within a SecureAddressProvider');
  }
  
  return context;
};
