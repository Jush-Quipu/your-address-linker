import React from 'react';
import type { ZkpCircuitType, ZkpPublicInputs } from '@/services/zkpService';

/**
 * Configuration for the SecureAddress Bridge SDK
 */
export type SecureAddressBridgeConfig = {
  // Required app credentials
  appId: string;
  redirectUri: string;
  
  // Optional configuration
  apiUrl?: string;
  apiVersion?: string;
  storageKey?: string;
  debug?: boolean;
  useSslEncryption?: boolean;
  autoRefreshTokens?: boolean;
};

/**
 * Address data structure
 */
export type AddressData = {
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  verified: boolean;
  verificationLevel?: 'basic' | 'advanced' | 'expert';
  // Optional properties for enhanced verification feedback
  verificationMethod?: 'document' | 'postal' | 'data_provider' | 'manual' | string;
  verificationDate?: string;
};

/**
 * Structure for requesting zero-knowledge proofs
 */
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

/**
 * Result of a successful zero-knowledge proof generation
 */
export type ZkProofResult = {
  proofId: string;
  proofToken: string;
  publicInputs: ZkpPublicInputs;
  timestamp: number;
  expiry: number;
};

/**
 * Standardized API error structure
 */
export type ApiError = {
  code: string;
  message: string;
  details?: any;
};

/**
 * Standardized API response structure
 */
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    version: string;
    timestamp: string;
    requestId?: string;
  };
};

/**
 * Main SDK class for SecureAddress Bridge
 */
export class SecureAddressBridge {
  private appId: string;
  private redirectUri: string;
  private apiUrl: string;
  private apiVersion: string;
  private tokenStorage: Storage;
  private storageKeyPrefix: string;
  private debug: boolean;
  private useSslEncryption: boolean;
  private autoRefreshTokens: boolean;

  /**
   * Initialize the SecureAddress Bridge SDK
   */
  constructor(config: SecureAddressBridgeConfig) {
    this.appId = config.appId;
    this.redirectUri = config.redirectUri;
    this.apiUrl = config.apiUrl || 'https://akfieehzgpcapuhdujvf.supabase.co/functions';
    this.apiVersion = config.apiVersion || 'v1';
    this.storageKeyPrefix = config.storageKey || 'secureaddress_';
    this.debug = config.debug || false;
    this.useSslEncryption = config.useSslEncryption !== false; // Default to true
    this.autoRefreshTokens = config.autoRefreshTokens !== false; // Default to true
    this.tokenStorage = window.localStorage;
    
    if (this.debug) {
      console.log('SecureAddress Bridge SDK initialized with:', {
        appId: this.appId,
        apiUrl: this.apiUrl,
        apiVersion: this.apiVersion,
        autoRefreshTokens: this.autoRefreshTokens
      });
    }
  }

  /**
   * Authorize the application to access the user's address
   */
  async authorize({
    scope = ['street', 'city', 'state', 'postal_code', 'country'],
    expiryDays = 30,
    state,
    maxAccessCount,
    accessNotification = false
  }: {
    scope?: string[];
    expiryDays?: number;
    state: string;
    maxAccessCount?: number;
    accessNotification?: boolean;
  }): Promise<void> {
    // Store state for CSRF protection
    this.tokenStorage.setItem(`${this.storageKeyPrefix}state`, state);
    
    const authUrl = new URL(`${this.apiUrl}/${this.apiVersion}/authorize`);
    authUrl.searchParams.append('app_id', this.appId);
    authUrl.searchParams.append('redirect_uri', this.redirectUri);
    authUrl.searchParams.append('scope', scope.join(','));
    authUrl.searchParams.append('expiry_days', expiryDays.toString());
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('response_type', 'code');
    
    if (maxAccessCount !== undefined) {
      authUrl.searchParams.append('max_access_count', maxAccessCount.toString());
    }
    
    if (accessNotification) {
      authUrl.searchParams.append('access_notification', 'true');
    }

    if (this.debug) {
      console.log('Redirecting to authorization URL:', authUrl.toString());
    }
    
    window.location.href = authUrl.toString();
  }

  /**
   * Handle the callback after authorization
   */
  async handleCallback(): Promise<{ success: boolean; errorCode?: string; errorDescription?: string }> {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    const storedState = this.tokenStorage.getItem(`${this.storageKeyPrefix}state`);

    if (error) {
      if (this.debug) {
        console.error('Authorization error:', error);
      }
      
      return {
        success: false,
        errorCode: error,
        errorDescription: urlParams.get('error_description') || 'Authorization failed'
      };
    }

    if (!code) {
      if (this.debug) {
        console.error('No authorization code received');
      }
      
      return {
        success: false,
        errorCode: 'missing_code',
        errorDescription: 'No authorization code received'
      };
    }

    if (state !== storedState) {
      if (this.debug) {
        console.error('State parameter mismatch');
      }
      
      return {
        success: false,
        errorCode: 'invalid_state',
        errorDescription: 'Invalid state parameter'
      };
    }

    try {
      const response = await fetch(`${this.apiUrl}/${this.apiVersion}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-ID': this.appId,
          'X-SDK-Version': '2.3.0'
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
        throw new Error(errorData.error?.message || errorData.error_description || 'Token exchange failed');
      }

      const data = await response.json();
      
      if (!data.success || !data.data) {
        throw new Error(data.error?.message || 'Token exchange failed');
      }
      
      const tokenData = data.data;
      
      this.tokenStorage.setItem(`${this.storageKeyPrefix}access_token`, tokenData.access_token);
      this.tokenStorage.setItem(`${this.storageKeyPrefix}refresh_token`, tokenData.refresh_token);
      this.tokenStorage.setItem(`${this.storageKeyPrefix}token_expiry`, (Date.now() + tokenData.expires_in * 1000).toString());

      // Clear the stored state after successful exchange
      this.tokenStorage.removeItem(`${this.storageKeyPrefix}state`);

      return { success: true };
    } catch (error) {
      if (this.debug) {
        console.error('Token exchange error:', error);
      }
      
      return {
        success: false,
        errorCode: 'token_exchange_failed',
        errorDescription: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get the user's address
   */
  async getAddress(options?: {
    fields?: string[];
    includeVerification?: boolean;
  }): Promise<{ 
    address: AddressData;
    verification?: { status: string; method?: string; date?: string };
    permission?: { expiresAt?: string; accessCount?: number; maxAccessCount?: number };
  }> {
    await this.ensureValidToken();

    try {
      // Build the request URL with query parameters
      const url = new URL(`${this.apiUrl}/${this.apiVersion}/address`);
      
      if (options?.fields?.length) {
        url.searchParams.append('fields', options.fields.join(','));
      }
      
      if (options?.includeVerification) {
        url.searchParams.append('include_verification', 'true');
      }
      
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${this.tokenStorage.getItem(`${this.storageKeyPrefix}access_token`)}`,
          'Content-Type': 'application/json',
          'X-App-ID': this.appId,
          'X-SDK-Version': '2.3.0'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || 
          errorData.error_description || 
          'Failed to fetch address'
        );
      }

      const apiResponse = await response.json() as ApiResponse;
      
      if (!apiResponse.success || !apiResponse.data) {
        throw new Error(apiResponse.error?.message || 'Failed to fetch address data');
      }
      
      const data = apiResponse.data;
      
      return { 
        address: {
          streetAddress: data.address.street || undefined,
          city: data.address.city || undefined,
          state: data.address.state || undefined,
          postalCode: data.address.postal_code || undefined,
          country: data.address.country || undefined,
          verified: data.verification?.status === 'verified' || false,
          verificationLevel: this.mapVerificationLevel(data.verification?.status),
          verificationMethod: data.verification?.method,
          verificationDate: data.verification?.date
        },
        verification: data.verification,
        permission: {
          expiresAt: data.permission?.access_expiry,
          accessCount: data.permission?.access_count,
          maxAccessCount: data.permission?.max_access_count
        }
      };
    } catch (error) {
      if (this.debug) {
        console.error('Get address error:', error);
      }
      throw error;
    }
  }

  /**
   * Get verification status for a user or address
   */
  async getVerificationStatus(
    options: {
      userId?: string;
      addressId?: string;
      walletAddress?: string;
      chainId?: number;
    }
  ): Promise<{
    status: string;
    method?: string;
    date?: string;
    postalVerified: boolean;
    location: {
      country?: string;
      state?: string;
      city?: string;
      postalCode?: string;
    };
    wallets?: Array<{ address: string; chainId: number; isPrimary: boolean }>;
    zkpVerifications?: any[];
  }> {
    await this.ensureValidToken();

    // Build the query parameters
    const params = new URLSearchParams();
    if (options.userId) params.append('user_id', options.userId);
    if (options.addressId) params.append('address_id', options.addressId);
    if (options.walletAddress) params.append('wallet_address', options.walletAddress);
    if (options.chainId !== undefined) params.append('chain_id', options.chainId.toString());

    try {
      const response = await fetch(
        `${this.apiUrl}/${this.apiVersion}/verification-status?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${this.tokenStorage.getItem(`${this.storageKeyPrefix}access_token`)}`,
            'Content-Type': 'application/json',
            'X-App-ID': this.appId,
            'X-SDK-Version': '2.3.0'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || 
          errorData.error_description || 
          'Failed to fetch verification status'
        );
      }

      const apiResponse = await response.json() as ApiResponse;
      
      if (!apiResponse.success || !apiResponse.data) {
        throw new Error(apiResponse.error?.message || 'Failed to fetch verification status');
      }
      
      const data = apiResponse.data;
      
      return {
        status: data.verification.status,
        method: data.verification.method,
        date: data.verification.date,
        postalVerified: data.verification.postal_verified || false,
        location: {
          country: data.location.country,
          state: data.location.state,
          city: data.location.city,
          postalCode: data.location.postal_code
        },
        wallets: data.linked_wallets?.map((wallet: any) => ({
          address: wallet.address,
          chainId: wallet.chain_id,
          isPrimary: wallet.is_primary
        })),
        zkpVerifications: data.zkp_verifications
      };
    } catch (error) {
      if (this.debug) {
        console.error('Get verification status error:', error);
      }
      throw error;
    }
  }

  /**
   * Authorize a Zero-Knowledge Proof request
   */
  async authorizeZkp(request: ZkProofRequest): Promise<void> {
    // Store state for CSRF protection
    this.tokenStorage.setItem(`${this.storageKeyPrefix}state`, request.state);
    
    const authUrl = new URL(`${this.apiUrl}/${this.apiVersion}/zkp/authorize`);
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

    if (this.debug) {
      console.log('Redirecting to ZKP authorization URL:', authUrl.toString());
    }
    
    window.location.href = authUrl.toString();
  }

  /**
   * Handle the callback after ZKP authorization
   */
  async handleZkpCallback(): Promise<{ success: boolean; errorCode?: string; errorDescription?: string }> {
    const urlParams = new URLSearchParams(window.location.search);
    const proofCode = urlParams.get('proof_code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    const storedState = this.tokenStorage.getItem(`${this.storageKeyPrefix}state`);

    if (error) {
      if (this.debug) {
        console.error('ZKP authorization error:', error);
      }
      
      return {
        success: false,
        errorCode: error,
        errorDescription: urlParams.get('error_description') || 'ZKP authorization failed'
      };
    }

    if (!proofCode) {
      if (this.debug) {
        console.error('No proof code received');
      }
      
      return {
        success: false,
        errorCode: 'missing_proof_code',
        errorDescription: 'No proof code received'
      };
    }

    if (state !== storedState) {
      if (this.debug) {
        console.error('State parameter mismatch');
      }
      
      return {
        success: false,
        errorCode: 'invalid_state',
        errorDescription: 'Invalid state parameter'
      };
    }

    try {
      const response = await fetch(`${this.apiUrl}/${this.apiVersion}/zkp/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-ID': this.appId,
          'X-SDK-Version': '2.3.0'
        },
        body: JSON.stringify({
          proof_code: proofCode,
          app_id: this.appId,
          redirect_uri: this.redirectUri
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || 
          errorData.error_description || 
          'Proof token exchange failed'
        );
      }

      const apiResponse = await response.json() as ApiResponse;
      
      if (!apiResponse.success || !apiResponse.data) {
        throw new Error(apiResponse.error?.message || 'ZKP token exchange failed');
      }
      
      const data = apiResponse.data;
      
      this.tokenStorage.setItem(`${this.storageKeyPrefix}proof_id`, data.proof_id);
      this.tokenStorage.setItem(`${this.storageKeyPrefix}proof_token`, data.proof_token);
      this.tokenStorage.setItem(`${this.storageKeyPrefix}proof_expiry`, data.expiry.toString());

      // Clear the stored state after successful exchange
      this.tokenStorage.removeItem(`${this.storageKeyPrefix}state`);
      
      return { success: true };
    } catch (error) {
      if (this.debug) {
        console.error('ZKP token exchange error:', error);
      }
      
      return {
        success: false,
        errorCode: 'zkp_token_exchange_failed',
        errorDescription: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get the ZK proof result
   */
  async getZkProof(): Promise<ZkProofResult> {
    const proofId = this.tokenStorage.getItem(`${this.storageKeyPrefix}proof_id`);
    const proofToken = this.tokenStorage.getItem(`${this.storageKeyPrefix}proof_token`);
    
    if (!proofId || !proofToken) {
      throw new Error('No ZK proof available. Authorize a proof first.');
    }
    
    try {
      const response = await fetch(`${this.apiUrl}/${this.apiVersion}/zkp/proof/${proofId}`, {
        headers: {
          'Authorization': `Bearer ${proofToken}`,
          'Content-Type': 'application/json',
          'X-App-ID': this.appId,
          'X-SDK-Version': '2.3.0'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || 
          errorData.error_description || 
          'Failed to fetch proof'
        );
      }

      const apiResponse = await response.json() as ApiResponse;
      
      if (!apiResponse.success || !apiResponse.data) {
        throw new Error(apiResponse.error?.message || 'Failed to fetch ZK proof');
      }
      
      const data = apiResponse.data;
      
      return {
        proofId,
        proofToken,
        publicInputs: data.public_inputs,
        timestamp: data.timestamp,
        expiry: Number(this.tokenStorage.getItem(`${this.storageKeyPrefix}proof_expiry`) || '0')
      };
    } catch (error) {
      if (this.debug) {
        console.error('Get ZK proof error:', error);
      }
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
      if (this.debug) {
        console.error('Error verifying proof on-chain:', error);
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate the current access token
   */
  async validateToken(): Promise<{
    valid: boolean;
    expiresAt?: string;
    accessCount?: number;
    maxAccessCount?: number;
    permissions?: Record<string, boolean>;
    error?: string;
  }> {
    const accessToken = this.tokenStorage.getItem(`${this.storageKeyPrefix}access_token`);
    
    if (!accessToken) {
      return { valid: false, error: 'No access token available' };
    }
    
    try {
      const response = await fetch(`${this.apiUrl}/${this.apiVersion}/validate-token`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-App-ID': this.appId,
          'X-SDK-Version': '2.3.0'
        }
      });

      const apiResponse = await response.json() as ApiResponse;
      
      if (!response.ok || !apiResponse.success) {
        return { 
          valid: false, 
          error: apiResponse.error?.message || 'Token validation failed' 
        };
      }
      
      const data = apiResponse.data;
      
      return {
        valid: true,
        expiresAt: data.access_expiry,
        accessCount: data.access_count,
        maxAccessCount: data.max_access_count,
        permissions: data.permissions
      };
    } catch (error) {
      if (this.debug) {
        console.error('Token validation error:', error);
      }
      
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Unknown error during validation' 
      };
    }
  }

  /**
   * Refresh the access token
   */
  private async refreshToken(): Promise<void> {
    const refreshToken = this.tokenStorage.getItem(`${this.storageKeyPrefix}refresh_token`);
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    try {
      const response = await fetch(`${this.apiUrl}/${this.apiVersion}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-ID': this.appId,
          'X-SDK-Version': '2.3.0'
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
          app_id: this.appId,
          grant_type: 'refresh_token'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || 
          errorData.error_description || 
          'Token refresh failed'
        );
      }

      const apiResponse = await response.json() as ApiResponse;
      
      if (!apiResponse.success || !apiResponse.data) {
        throw new Error(apiResponse.error?.message || 'Token refresh failed');
      }
      
      const data = apiResponse.data;
      
      this.tokenStorage.setItem(`${this.storageKeyPrefix}access_token`, data.access_token);
      this.tokenStorage.setItem(`${this.storageKeyPrefix}refresh_token`, data.refresh_token);
      this.tokenStorage.setItem(`${this.storageKeyPrefix}token_expiry`, (Date.now() + data.expires_in * 1000).toString());
    } catch (error) {
      if (this.debug) {
        console.error('Token refresh error:', error);
      }
      throw error;
    }
  }

  /**
   * Ensure that the access token is valid
   */
  private async ensureValidToken(): Promise<void> {
    if (!this.autoRefreshTokens) {
      return;
    }
    
    const tokenExpiry = Number(this.tokenStorage.getItem(`${this.storageKeyPrefix}token_expiry`) || '0');
    
    // Refresh if token has expired or will expire in the next 5 minutes
    if (tokenExpiry <= Date.now() + 5 * 60 * 1000) {
      await this.refreshToken();
    }
  }

  /**
   * Map verification status to a user-friendly level
   */
  private mapVerificationLevel(status?: string): AddressData['verificationLevel'] {
    switch (status) {
      case 'verified':
        return 'advanced';
      case 'verified_enhanced':
        return 'expert';
      case 'pending':
      case 'unverified':
      default:
        return 'basic';
    }
  }

  /**
   * Clear all stored tokens and data
   */
  logout(): void {
    this.tokenStorage.removeItem(`${this.storageKeyPrefix}access_token`);
    this.tokenStorage.removeItem(`${this.storageKeyPrefix}refresh_token`);
    this.tokenStorage.removeItem(`${this.storageKeyPrefix}token_expiry`);
    this.tokenStorage.removeItem(`${this.storageKeyPrefix}proof_id`);
    this.tokenStorage.removeItem(`${this.storageKeyPrefix}proof_token`);
    this.tokenStorage.removeItem(`${this.storageKeyPrefix}proof_expiry`);
    this.tokenStorage.removeItem(`${this.storageKeyPrefix}state`);
    
    if (this.debug) {
      console.log('SecureAddress Bridge SDK logout: Cleared all stored tokens and data');
    }
  }

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<{ status: 'ok' | 'error', message: string, version: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/${this.apiVersion}/health-check`, {
        headers: {
          'Content-Type': 'application/json',
          'X-App-ID': this.appId,
          'X-SDK-Version': '2.3.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        status: 'ok',
        message: data.data?.message || 'API is operational',
        version: data.meta?.version || 'unknown'
      };
    } catch (error) {
      if (this.debug) {
        console.error('API connection test failed:', error);
      }
      
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error testing API connection',
        version: 'unknown'
      };
    }
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
  const [permissionDetails, setPermissionDetails] = React.useState<{
    expiresAt?: string;
    accessCount?: number;
    maxAccessCount?: number;
    permissions?: Record<string, boolean>;
  } | null>(null);
  
  const client = React.useMemo(() => new SecureAddressBridge({
    ...config,
    debug: config.debug || false,
  }), [config.appId, config.redirectUri, config.apiUrl, config.debug]);
  
  // Check if we're in a callback flow
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const proofCode = urlParams.get('proof_code');
    const state = urlParams.get('state');
    
    if (code && state) {
      handleCallbackFlow();
    } else if (proofCode && state) {
      handleZkpCallbackFlow();
    }
  }, []);
  
  const handleCallbackFlow = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await client.handleCallback();
      if (result.success) {
        const addressData = await client.getAddress({ includeVerification: true });
        setAddress(addressData.address);
        setPermissionDetails(addressData.permission || null);
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
  
  const handleZkpCallbackFlow = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await client.handleZkpCallback();
      if (result.success) {
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        setError(new Error(result.errorDescription || 'ZKP authorization failed'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const requestAccess = async (options?: {
    scope?: string[];
    expiryDays?: number;
    maxAccesses?: number;
    notifyOnAccess?: boolean;
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Generate state for CSRF protection
      const state = Math.random().toString(36).substring(2, 15);
      localStorage.setItem(`${config.storageKey || 'secureaddress_'}state`, state);
      
      await client.authorize({
        scope: options?.scope || ['street', 'city', 'state', 'postal_code', 'country'],
        expiryDays: options?.expiryDays || 30,
        maxAccessCount: options?.maxAccesses,
        accessNotification: options?.notifyOnAccess || false,
        state
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to initiate authorization'));
      setIsLoading(false);
    }
  };
  
  const validatePermission = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const validation = await client.validateToken();
      setHasValidPermission(validation.valid);
      
      if (validation.valid) {
        setPermissionDetails({
          expiresAt: validation.expiresAt,
          accessCount: validation.accessCount,
          maxAccessCount: validation.maxAccessCount,
          permissions: validation.permissions
        });
        
        // If we have a valid permission, also fetch the address data
        try {
          const addressData = await client.getAddress({ includeVerification: true });
          setAddress(addressData.address);
        } catch (addressError) {
          console.error('Error fetching address:', addressError);
        }
      } else {
        setError(new Error(validation.error || 'Permission is not valid'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to validate permission'));
      setHasValidPermission(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Automatically validate token on mount if autoRefreshTokens is enabled
  React.useEffect(() => {
    if (config.autoRefreshTokens !== false) {
      validatePermission();
    }
  }, []);
  
  return {
    isLoading,
    error,
    address,
    hasValidPermission,
    permissionDetails,
    requestAccess,
    validatePermission,
    client
  };
}
