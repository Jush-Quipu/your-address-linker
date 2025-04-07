import { v4 as uuidv4 } from 'uuid';

export class SecureAddressBridge {
  private appId: string;
  private apiUrl: string;
  private redirectUri?: string;
  private state?: string;
  private isSandboxMode: boolean;

  constructor(options: {
    appId: string;
    apiUrl?: string;
    redirectUri?: string;
    sandbox?: boolean;
  }) {
    this.appId = options.appId;
    this.apiUrl = options.apiUrl || 'https://api.secureaddress.bridge';
    this.redirectUri = options.redirectUri;
    this.isSandboxMode = options.sandbox || true; // Default to sandbox mode for development
    
    console.log(`SecureAddressBridge SDK initialized with appId: ${this.appId}`);
    console.log(`API URL: ${this.apiUrl}`);
    console.log(`Sandbox mode: ${this.isSandboxMode ? 'enabled' : 'disabled'}`);
    
    // Register the SDK globally if in browser environment
    if (typeof window !== 'undefined') {
      window.SecureAddressBridge = this;
    }
  }

  /**
   * Authorize a user to link their wallet with their physical address
   */
  async authorize(options: {
    redirectUri?: string;
    state?: string;
    scope?: string[];
  }): Promise<void> {
    console.log('Authorizing user with options:', options);
    const redirectUri = options.redirectUri || this.redirectUri;
    if (!redirectUri) {
      throw new Error('redirectUri is required either in the constructor or authorize options');
    }

    // Generate a state parameter for CSRF protection
    const state = options.state || uuidv4();
    this.state = state;
    
    console.log(`Generated state: ${state}`);
    console.log(`Storing state in localStorage`);

    // Store state in localStorage to verify when the user returns
    try {
      localStorage.setItem('secureaddress_state', state);
    } catch (e) {
      console.error('Failed to store state in localStorage:', e);
    }

    // Build the authorization URL
    const authUrl = new URL(`${this.apiUrl}/authorize`);
    authUrl.searchParams.append('app_id', this.appId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('state', state);
    if (options.scope) {
      authUrl.searchParams.append('scope', options.scope.join(' '));
    }

    const finalUrl = authUrl.toString();
    console.log(`Redirecting to: ${finalUrl}`);
    
    // In sandbox mode, simulate a successful auth flow
    if (this.isSandboxMode) {
      console.log('Sandbox mode: Simulating authorization flow');
      
      // Simulate a redirect and callback
      const callbackUrl = new URL(`${redirectUri}`);
      callbackUrl.searchParams.append('code', 'sandbox_auth_code_' + uuidv4());
      callbackUrl.searchParams.append('state', state);
      
      console.log(`Sandbox: Would redirect to ${callbackUrl.toString()}`);
      
      // Actually redirect
      window.location.href = callbackUrl.toString();
      return;
    }
    
    // Redirect the user to the authorization URL
    window.location.href = finalUrl;
  }

  /**
   * Handle the callback after authorization
   */
  async handleCallback(callbackUrl?: string): Promise<{
    success: boolean;
    token?: string;
    error?: string;
  }> {
    const url = new URL(callbackUrl || window.location.href);
    const error = url.searchParams.get('error');
    const state = url.searchParams.get('state');
    const code = url.searchParams.get('code');

    // Check for errors
    if (error) {
      return { success: false, error };
    }

    // Verify state parameter to prevent CSRF attacks
    const storedState = localStorage.getItem('secureaddress_state');
    if (!state || state !== storedState) {
      return { success: false, error: 'Invalid state parameter' };
    }

    // Clear the stored state
    localStorage.removeItem('secureaddress_state');

    // If no code was returned, return an error
    if (!code) {
      return { success: false, error: 'No authorization code received' };
    }

    // Exchange the code for an access token
    try {
      const response = await fetch(`${this.apiUrl}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_id: this.appId,
          code,
          redirect_uri: this.redirectUri,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to exchange code for token' };
      }

      return { success: true, token: data.access_token };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get a user's address using an access token
   */
  async getAddress(token: string): Promise<{
    success: boolean;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/get-address?access_token=${token}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-App-ID': this.appId,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to get address' };
      }

      return { success: true, address: data.address };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Generate a Zero-Knowledge Proof for address attributes without revealing the address
   */
  async authorizeZkp(options: {
    proofType: string;
    predicates: Array<{
      field: string;
      operation: string;
      value?: string;
      values?: string[];
    }>;
    expiryDays?: number;
    redirectUri?: string;
    state?: string;
  }): Promise<void> {
    const redirectUri = options.redirectUri || this.redirectUri;
    if (!redirectUri) {
      throw new Error('redirectUri is required either in the constructor or authorizeZkp options');
    }

    // Generate a state parameter for CSRF protection
    const state = options.state || uuidv4();
    this.state = state;

    // Store state in localStorage to verify when the user returns
    localStorage.setItem('secureaddress_zkp_state', state);

    // Build the ZKP authorization URL
    const zkpAuthUrl = new URL(`${this.apiUrl}/authorize-zkp`);
    zkpAuthUrl.searchParams.append('app_id', this.appId);
    zkpAuthUrl.searchParams.append('redirect_uri', redirectUri);
    zkpAuthUrl.searchParams.append('state', state);
    zkpAuthUrl.searchParams.append('proof_type', options.proofType);
    
    if (options.expiryDays) {
      zkpAuthUrl.searchParams.append('expiry_days', options.expiryDays.toString());
    }
    
    // Add predicates as a JSON string
    zkpAuthUrl.searchParams.append('predicates', JSON.stringify(options.predicates));

    // Redirect the user to the authorization URL
    window.location.href = zkpAuthUrl.toString();
  }

  /**
   * Get a zero-knowledge proof
   */
  async getZkProof(): Promise<{
    success: boolean;
    proof?: {
      id: string;
      type: string;
      predicates: Array<{
        field: string;
        operation: string;
        value?: string;
        values?: string[];
      }>;
      verified: boolean;
      created_at: string;
      expires_at: string;
    };
    error?: string;
  }> {
    console.log('Getting ZK proof');
    const proofId = localStorage.getItem('secureaddress_proof_id');
    const proofToken = localStorage.getItem('secureaddress_proof_token');

    if (!proofId || !proofToken) {
      console.log('No proof information available');
      return { success: false, error: 'No proof information available' };
    }

    // In sandbox mode, return a mock proof
    if (this.isSandboxMode) {
      console.log('Sandbox mode: Returning mock ZK proof');
      return {
        success: true,
        proof: {
          id: proofId,
          type: 'address_verification',
          predicates: [
            {
              field: 'country',
              operation: 'equals',
              value: 'US'
            },
            {
              field: 'state',
              operation: 'equals',
              value: 'CA'
            }
          ],
          verified: true,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      };
    }

    try {
      const response = await fetch(`${this.apiUrl}/zkp/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-ID': this.appId,
        },
        body: JSON.stringify({
          proof_id: proofId,
          proof_token: proofToken,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('Failed to verify ZK proof:', data);
        return { success: false, error: data.error || 'Failed to verify ZK proof' };
      }

      return { success: true, proof: data.proof };
    } catch (error) {
      console.error('Error verifying ZK proof:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Verify a wallet's ownership using a message signature
   */
  async verifyWallet(options: {
    address: string;
    chainId?: number;
    message?: string;
    signature: string;
  }): Promise<{
    success: boolean;
    verified?: boolean;
    error?: string;
  }> {
    const { address, chainId = 1, message = 'Verify wallet ownership for SecureAddress Bridge', signature } = options;
    
    console.log('Verifying wallet with options:', options);
    
    // In sandbox mode, always verify successfully
    if (this.isSandboxMode) {
      console.log('Sandbox mode: Simulating successful wallet verification');
      return { success: true, verified: true };
    }

    try {
      const response = await fetch(`${this.apiUrl}/wallet-verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-ID': this.appId,
        },
        body: JSON.stringify({
          wallet_address: address,
          chain_id: chainId,
          message,
          signature,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('Failed to verify wallet:', data);
        return { success: false, error: data.error || 'Failed to verify wallet' };
      }

      return { success: true, verified: data.verified };
    } catch (error) {
      console.error('Error verifying wallet:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Link a wallet to a verified address using ZKP to ensure privacy
   */
  async linkWalletToAddress(options: {
    wallet_address: string;
    chain_id?: number;
    proofId?: string;
    proofToken?: string;
  }): Promise<{
    success: boolean;
    linked?: boolean;
    linkId?: string;
    error?: string;
  }> {
    const { wallet_address, chain_id = 1, proofId, proofToken } = options;
    
    console.log('Linking wallet to address with options:', options);

    // Use stored proof if not provided
    const finalProofId = proofId || localStorage.getItem('secureaddress_proof_id');
    const finalProofToken = proofToken || localStorage.getItem('secureaddress_proof_token');
    
    // In sandbox mode, always succeed
    if (this.isSandboxMode) {
      console.log('Sandbox mode: Simulating successful wallet-address linking');
      return { 
        success: true, 
        linked: true, 
        linkId: `sandbox_link_${uuidv4()}` 
      };
    }

    try {
      const response = await fetch(`${this.apiUrl}/link-wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-ID': this.appId,
        },
        body: JSON.stringify({
          wallet_address,
          chain_id,
          proof_id: finalProofId,
          proof_token: finalProofToken,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('Failed to link wallet to address:', data);
        return { success: false, error: data.error || 'Failed to link wallet to address' };
      }

      return { 
        success: true, 
        linked: true, 
        linkId: data.link_id 
      };
    } catch (error) {
      console.error('Error linking wallet to address:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Handle the callback after ZKP authorization
   */
  async handleZkpCallback(callbackUrl?: string): Promise<{
    success: boolean;
    proofId?: string;
    error?: string;
  }> {
    console.log('Handling ZKP callback');
    const url = new URL(callbackUrl || window.location.href);
    const error = url.searchParams.get('error');
    const state = url.searchParams.get('state');
    const proofId = url.searchParams.get('proof_id');
    const proofToken = url.searchParams.get('proof_token');
    
    console.log(`ZKP callback URL: ${url.toString()}`);
    console.log(`Error: ${error}, State: ${state}, ProofId: ${proofId}, ProofToken: ${proofToken ? 'present' : 'missing'}`);

    // Check for errors
    if (error) {
      console.error('Error in ZKP callback:', error);
      return { success: false, error };
    }

    // Verify state parameter to prevent CSRF attacks
    const storedState = localStorage.getItem('secureaddress_zkp_state');
    if (!state || state !== storedState) {
      console.error('Invalid state parameter', { state, storedState });
      return { success: false, error: 'Invalid state parameter' };
    }

    console.log('State verification successful, clearing stored state');
    // Clear the stored state
    localStorage.removeItem('secureaddress_zkp_state');

    // If no proof_id was returned, return an error
    if (!proofId || !proofToken) {
      console.error('No proof information received');
      return { success: false, error: 'No proof information received' };
    }

    // Store the proof information
    console.log(`Storing proof information: ID=${proofId}`);
    localStorage.setItem('secureaddress_proof_id', proofId);
    localStorage.setItem('secureaddress_proof_token', proofToken);

    return { success: true, proofId };
  }
}
