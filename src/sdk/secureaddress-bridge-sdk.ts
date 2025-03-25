
import type { ZkpCircuitType, ZkpPublicInputs } from '@/services/zkpService';

export type SecureAddressBridgeConfig = {
  appId: string;
  redirectUri: string;
  apiUrl?: string;
};

export type AddressData = {
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  verified: boolean;
  verificationLevel?: 'basic' | 'advanced' | 'expert';
};

export type ZkProofRequest = {
  proofType: string;
  predicates?: Array<{
    field: 'country' | 'state' | 'city' | 'postal_code';
    operation: 'equals' | 'in' | 'starts_with' | 'contains';
    value?: string;
    values?: string[];
  }>;
  expiryDays?: number;
  state: string;
};

export type ZkProofResult = {
  proofId: string;
  proofToken: string;
  publicInputs: ZkpPublicInputs;
  timestamp: number;
  expiry: number;
};

export class SecureAddressBridge {
  private appId: string;
  private redirectUri: string;
  private apiUrl: string;
  private tokenStorage: Storage;

  constructor(config: SecureAddressBridgeConfig) {
    this.appId = config.appId;
    this.redirectUri = config.redirectUri;
    this.apiUrl = config.apiUrl || 'https://api.secureaddress-bridge.com';
    this.tokenStorage = window.localStorage;
  }

  /**
   * Authorize the application to access the user's address
   */
  async authorize({
    scope = ['street', 'city', 'state', 'postal_code', 'country'],
    expiryDays = 30,
    state
  }: {
    scope?: string[];
    expiryDays?: number;
    state: string;
  }): Promise<void> {
    const authUrl = new URL(`${this.apiUrl}/authorize`);
    authUrl.searchParams.append('app_id', this.appId);
    authUrl.searchParams.append('redirect_uri', this.redirectUri);
    authUrl.searchParams.append('scope', scope.join(','));
    authUrl.searchParams.append('expiry_days', expiryDays.toString());
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('response_type', 'code');

    console.log('Redirecting to authorization URL:', authUrl.toString());
    window.location.href = authUrl.toString();
  }

  /**
   * Handle the callback after authorization
   */
  async handleCallback(): Promise<{ success: boolean; errorDescription?: string }> {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    const storedState = this.tokenStorage.getItem('secureaddress_state');

    if (error) {
      console.error('Authorization error:', error);
      return {
        success: false,
        errorDescription: urlParams.get('error_description') || 'Authorization failed'
      };
    }

    if (!code) {
      console.error('No authorization code received');
      return {
        success: false,
        errorDescription: 'No authorization code received'
      };
    }

    if (state !== storedState) {
      console.error('State parameter mismatch');
      return {
        success: false,
        errorDescription: 'Invalid state parameter'
      };
    }

    try {
      const response = await fetch(`${this.apiUrl}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code,
          app_id: this.appId,
          redirect_uri: this.redirectUri,
          grant_type: 'authorization_code'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error_description || 'Token exchange failed');
      }

      const data = await response.json();
      this.tokenStorage.setItem('secureaddress_access_token', data.access_token);
      this.tokenStorage.setItem('secureaddress_refresh_token', data.refresh_token);
      this.tokenStorage.setItem('secureaddress_token_expiry', (Date.now() + data.expires_in * 1000).toString());

      return { success: true };
    } catch (error) {
      console.error('Token exchange error:', error);
      return {
        success: false,
        errorDescription: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get the user's address
   */
  async getAddress(): Promise<{ address: AddressData }> {
    await this.ensureValidToken();

    try {
      const response = await fetch(`${this.apiUrl}/address`, {
        headers: {
          'Authorization': `Bearer ${this.tokenStorage.getItem('secureaddress_access_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error_description || 'Failed to fetch address');
      }

      const data = await response.json();
      return { address: data };
    } catch (error) {
      console.error('Get address error:', error);
      throw error;
    }
  }

  /**
   * Authorize a Zero-Knowledge Proof request
   */
  async authorizeZkp(request: ZkProofRequest): Promise<void> {
    const authUrl = new URL(`${this.apiUrl}/zkp/authorize`);
    authUrl.searchParams.append('app_id', this.appId);
    authUrl.searchParams.append('redirect_uri', this.redirectUri);
    authUrl.searchParams.append('proof_type', request.proofType);
    
    if (request.predicates && request.predicates.length > 0) {
      authUrl.searchParams.append('predicates', JSON.stringify(request.predicates));
    }
    
    if (request.expiryDays) {
      authUrl.searchParams.append('expiry_days', request.expiryDays.toString());
    }
    
    authUrl.searchParams.append('state', request.state);
    authUrl.searchParams.append('response_type', 'zk_proof');

    console.log('Redirecting to ZKP authorization URL:', authUrl.toString());
    window.location.href = authUrl.toString();
  }

  /**
   * Handle the callback after ZKP authorization
   */
  async handleZkpCallback(): Promise<{ success: boolean; errorDescription?: string }> {
    const urlParams = new URLSearchParams(window.location.search);
    const proofCode = urlParams.get('proof_code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    const storedState = this.tokenStorage.getItem('secureaddress_state');

    if (error) {
      console.error('ZKP authorization error:', error);
      return {
        success: false,
        errorDescription: urlParams.get('error_description') || 'ZKP authorization failed'
      };
    }

    if (!proofCode) {
      console.error('No proof code received');
      return {
        success: false,
        errorDescription: 'No proof code received'
      };
    }

    if (state !== storedState) {
      console.error('State parameter mismatch');
      return {
        success: false,
        errorDescription: 'Invalid state parameter'
      };
    }

    try {
      const response = await fetch(`${this.apiUrl}/zkp/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          proof_code: proofCode,
          app_id: this.appId,
          redirect_uri: this.redirectUri
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error_description || 'Proof token exchange failed');
      }

      const data = await response.json();
      this.tokenStorage.setItem('secureaddress_proof_id', data.proof_id);
      this.tokenStorage.setItem('secureaddress_proof_token', data.proof_token);
      this.tokenStorage.setItem('secureaddress_proof_expiry', data.expiry.toString());

      return { success: true };
    } catch (error) {
      console.error('ZKP token exchange error:', error);
      return {
        success: false,
        errorDescription: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get the ZK proof result
   */
  async getZkProof(): Promise<ZkProofResult> {
    const proofId = this.tokenStorage.getItem('secureaddress_proof_id');
    const proofToken = this.tokenStorage.getItem('secureaddress_proof_token');
    
    if (!proofId || !proofToken) {
      throw new Error('No ZK proof available. Authorize a proof first.');
    }
    
    try {
      const response = await fetch(`${this.apiUrl}/zkp/proof/${proofId}`, {
        headers: {
          'Authorization': `Bearer ${proofToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error_description || 'Failed to fetch proof');
      }

      const data = await response.json();
      return {
        proofId,
        proofToken,
        publicInputs: data.public_inputs,
        timestamp: data.timestamp,
        expiry: Number(this.tokenStorage.getItem('secureaddress_proof_expiry') || '0')
      };
    } catch (error) {
      console.error('Get ZK proof error:', error);
      throw error;
    }
  }

  /**
   * Verify a ZK proof on-chain (for web3 applications)
   */
  async verifyProofOnChain(contractAddress: string, chainId: number): Promise<{
    success: boolean;
    transactionHash?: string;
    error?: string;
  }> {
    try {
      // Check if Web3 is available
      if (typeof window.ethereum === 'undefined') {
        throw new Error('Web3 provider not found. Please install MetaMask or similar wallet.');
      }
      
      const proofResult = await this.getZkProof();
      
      // This would prepare the proof for on-chain verification
      // In a real implementation, this would use a library like ethers.js to send a transaction
      
      // For now, return a mock result
      return {
        success: true,
        transactionHash: `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`
      };
    } catch (error) {
      console.error('Error verifying proof on-chain:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Refresh the access token
   */
  private async refreshToken(): Promise<void> {
    const refreshToken = this.tokenStorage.getItem('secureaddress_refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    try {
      const response = await fetch(`${this.apiUrl}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
          app_id: this.appId,
          grant_type: 'refresh_token'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error_description || 'Token refresh failed');
      }

      const data = await response.json();
      this.tokenStorage.setItem('secureaddress_access_token', data.access_token);
      this.tokenStorage.setItem('secureaddress_refresh_token', data.refresh_token);
      this.tokenStorage.setItem('secureaddress_token_expiry', (Date.now() + data.expires_in * 1000).toString());
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  /**
   * Ensure that the access token is valid
   */
  private async ensureValidToken(): Promise<void> {
    const tokenExpiry = Number(this.tokenStorage.getItem('secureaddress_token_expiry') || '0');
    
    if (tokenExpiry <= Date.now()) {
      await this.refreshToken();
    }
  }

  /**
   * Clear all stored tokens and data
   */
  logout(): void {
    this.tokenStorage.removeItem('secureaddress_access_token');
    this.tokenStorage.removeItem('secureaddress_refresh_token');
    this.tokenStorage.removeItem('secureaddress_token_expiry');
    this.tokenStorage.removeItem('secureaddress_proof_id');
    this.tokenStorage.removeItem('secureaddress_proof_token');
    this.tokenStorage.removeItem('secureaddress_proof_expiry');
    this.tokenStorage.removeItem('secureaddress_state');
  }
}

/**
 * React hook for using SecureAddress in functional components
 */
export function useSecureAddress(config: SecureAddressBridgeConfig) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [address, setAddress] = React.useState<AddressData | null>(null);
  const [hasValidPermission, setHasValidPermission] = React.useState<boolean>(false);
  
  const client = React.useMemo(() => new SecureAddressBridge(config), [config.appId, config.redirectUri]);
  
  // Check if we're in a callback flow
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state) {
      handleCallbackFlow();
    }
  }, []);
  
  const handleCallbackFlow = async () => {
    setIsLoading(true);
    try {
      const result = await client.handleCallback();
      if (result.success) {
        const addressData = await client.getAddress();
        setAddress(addressData.address);
        setHasValidPermission(true);
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        setError(new Error(result.errorDescription || 'Authorization failed'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const requestAccess = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Generate state for CSRF protection
      const state = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('secureaddress_state', state);
      
      await client.authorize({
        scope: ['street', 'city', 'state', 'postal_code', 'country'],
        expiryDays: 30,
        state
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to initiate authorization'));
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    error,
    address,
    hasValidPermission,
    requestAccess,
    client
  };
}
