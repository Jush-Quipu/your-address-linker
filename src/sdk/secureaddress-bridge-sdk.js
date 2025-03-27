// Main SDK implementation for browser environments
export class SecureAddressBridge {
  constructor(options) {
    this.appId = options.appId;
    this.apiUrl = options.apiUrl || 'https://api.secureaddress.bridge';
    this.redirectUri = options.redirectUri;
  }

  // Authorization methods
  async authorize(options) {
    const redirectUri = options.redirectUri || this.redirectUri;
    if (!redirectUri) {
      throw new Error('redirectUri is required either in the constructor or authorize options');
    }

    // Generate a state parameter for CSRF protection
    const state = options.state || uuidv4();
    this.state = state;

    // Store state in localStorage to verify when the user returns
    localStorage.setItem('secureaddress_state', state);

    // Build the authorization URL
    const authUrl = new URL(`${this.apiUrl}/authorize`);
    authUrl.searchParams.append('app_id', this.appId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('state', state);
    if (options.scope) {
      authUrl.searchParams.append('scope', options.scope.join(' '));
    }

    // Redirect the user to the authorization URL
    window.location.href = authUrl.toString();
  }

  async handleCallback(callbackUrl) {
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

  // Address methods
  async getAddress(token) {
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

  // ZKP methods
  async authorizeZkp(options) {
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

  async handleZkpCallback(callbackUrl) {
    const url = new URL(callbackUrl || window.location.href);
    const error = url.searchParams.get('error');
    const state = url.searchParams.get('state');
    const proofId = url.searchParams.get('proof_id');
    const proofToken = url.searchParams.get('proof_token');

    // Check for errors
    if (error) {
      return { success: false, error };
    }

    // Verify state parameter to prevent CSRF attacks
    const storedState = localStorage.getItem('secureaddress_zkp_state');
    if (!state || state !== storedState) {
      return { success: false, error: 'Invalid state parameter' };
    }

    // Clear the stored state
    localStorage.removeItem('secureaddress_zkp_state');

    // If no proof_id was returned, return an error
    if (!proofId || !proofToken) {
      return { success: false, error: 'No proof information received' };
    }

    // Store the proof information
    localStorage.setItem('secureaddress_proof_id', proofId);
    localStorage.setItem('secureaddress_proof_token', proofToken);

    return { success: true, proofId };
  }

  async getZkProof() {
    const proofId = localStorage.getItem('secureaddress_proof_id');
    const proofToken = localStorage.getItem('secureaddress_proof_token');

    if (!proofId || !proofToken) {
      return { success: false, error: 'No proof information available' };
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
        return { success: false, error: data.error || 'Failed to verify ZK proof' };
      }

      return { success: true, proof: data.proof };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Wallet methods
  async verifyWallet(options) {
    const { address, chainId = 1, message = 'Verify wallet ownership for SecureAddress Bridge', signature } = options;

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
        return { success: false, error: data.error || 'Failed to verify wallet' };
      }

      return { success: true, verified: data.verified };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async linkWalletToAddress(options) {
    const { wallet_address, chain_id = 1, proofId, proofToken } = options;

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
          proof_id: proofId,
          proof_token: proofToken,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to link wallet to address' };
      }

      return { 
        success: true, 
        linked: true, 
        linkId: data.link_id 
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}
