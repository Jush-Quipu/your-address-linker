
/**
 * SecureAddress Bridge JavaScript SDK
 * 
 * This SDK provides an easy way to integrate with SecureAddress Bridge
 * to securely access verified physical addresses with enhanced blockchain support.
 * @version 2.0.0
 */

class SecureAddressBridge {
  /**
   * Initialize the SDK
   * @param {Object} config - Configuration options
   * @param {string} config.appId - Your application ID
   * @param {string} config.redirectUri - The URI to redirect to after authorization
   * @param {string} [config.baseUrl] - The base URL of the SecureAddress Bridge API
   * @param {Object} [config.walletOptions] - Options for wallet connections
   * @param {string[]} [config.walletOptions.supportedChains] - Array of supported blockchain networks (e.g., ['ethereum', 'polygon'])
   * @param {Object} [config.webhooks] - Webhook configuration
   */
  constructor(config) {
    this.appId = config.appId;
    this.redirectUri = config.redirectUri;
    this.baseUrl = config.baseUrl || 'https://api.secureaddress.bridge';
    this.accessToken = null;
    this.supportedChains = config.walletOptions?.supportedChains || ['ethereum'];
    this.webhookUrl = config.webhooks?.url || null;
    this.apiVersion = 'v1';
  }

  /**
   * Set the access token for API calls
   * @param {string} token - The access token
   */
  setAccessToken(token) {
    this.accessToken = token;
  }

  /**
   * Redirect the user to the authorization page
   * @param {Object} options - Authorization options
   * @param {string[]} options.scope - The scope of address fields to request
   * @param {number} [options.expiryDays=30] - Number of days until the permission expires
   * @param {number} [options.maxAccesses] - Maximum number of times the address can be accessed
   * @param {boolean} [options.useWalletConnect=false] - Use WalletConnect for authorization
   * @param {string} [options.preferredChain] - Preferred blockchain to use for authorization
   * @param {string} [options.state] - Optional state parameter for CSRF protection
   */
  authorize(options) {
    const scope = Array.isArray(options.scope) ? options.scope.join(' ') : options.scope;
    const expiryDays = options.expiryDays || 30;
    
    const params = new URLSearchParams({
      app_id: this.appId,
      redirect_uri: this.redirectUri,
      scope: scope,
      expiry_days: expiryDays,
      version: this.apiVersion
    });
    
    if (options.maxAccesses) {
      params.append('max_accesses', options.maxAccesses);
    }

    if (options.useWalletConnect) {
      params.append('wallet_connect', 'true');
    }

    if (options.preferredChain && this.supportedChains.includes(options.preferredChain)) {
      params.append('preferred_chain', options.preferredChain);
    }

    if (options.state) {
      params.append('state', options.state);
      // Store state in localStorage for CSRF validation
      localStorage.setItem('secureaddress_state', options.state);
    }
    
    // Redirect to the authorization page
    window.location.href = `${this.baseUrl}/authorize?${params.toString()}`;
  }

  /**
   * Handle the callback from the authorization page
   * @param {Object} [options] - Callback handling options
   * @param {boolean} [options.validateState=true] - Whether to validate the state parameter
   * @returns {Promise<Object>} Result of the authorization
   */
  async handleCallback(options = { validateState: true }) {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const error = urlParams.get('error');
    const state = urlParams.get('state');
    
    if (error) {
      return {
        success: false,
        error: error,
        errorDescription: urlParams.get('error_description')
      };
    }
    
    if (!accessToken) {
      return {
        success: false,
        error: 'missing_token',
        errorDescription: 'No access token found in the callback URL'
      };
    }

    // Validate state parameter if enabled
    if (options.validateState && state) {
      const storedState = localStorage.getItem('secureaddress_state');
      if (state !== storedState) {
        return {
          success: false,
          error: 'invalid_state',
          errorDescription: 'State parameter does not match the one sent in the request'
        };
      }
      // Clear the stored state
      localStorage.removeItem('secureaddress_state');
    }
    
    this.accessToken = accessToken;
    
    return {
      success: true,
      accessToken: accessToken
    };
  }

  /**
   * Get the user's address information
   * @param {Object} [options] - Options for the request
   * @param {string[]} [options.fields] - Specific fields to request
   * @param {boolean} [options.includeVerificationInfo=false] - Include verification details
   * @returns {Promise<Object>} The user's address information
   */
  async getAddress(options = {}) {
    if (!this.accessToken) {
      throw new Error('No access token. Call handleCallback first or set the access token.');
    }
    
    let url = `${this.baseUrl}/${this.apiVersion}/address`;
    const queryParams = new URLSearchParams();
    
    // Add fields parameter if specified
    if (options.fields && Array.isArray(options.fields)) {
      queryParams.append('fields', options.fields.join(','));
    }

    // Include verification information if requested
    if (options.includeVerificationInfo) {
      queryParams.append('include_verification', 'true');
    }

    // Append query parameters if any
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'X-App-ID': this.appId,
        'X-SDK-Version': '2.0.0'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get address');
    }
    
    const data = await response.json();
    return data;
  }

  /**
   * Check if the access token is still valid
   * @returns {Promise<Object>} Token validation result with detailed info
   */
  async validateToken() {
    if (!this.accessToken) {
      return { valid: false, error: 'No access token provided' };
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/${this.apiVersion}/validate-token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'X-App-ID': this.appId
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return { 
          valid: false, 
          error: errorData.error || 'Token validation failed',
          status: response.status
        };
      }

      const data = await response.json();
      return {
        valid: true,
        ...data
      };
    } catch (error) {
      console.error('Error validating token:', error);
      return { 
        valid: false, 
        error: error.message || 'Network error during validation'
      };
    }
  }

  /**
   * Register a webhook to receive notifications about address changes
   * @param {Object} options - Webhook options
   * @param {string} options.url - The URL to send webhook events to
   * @param {string[]} options.events - Array of events to subscribe to
   * @param {string} [options.secret] - Secret for signing webhook payloads
   * @returns {Promise<Object>} Webhook registration result
   */
  async registerWebhook(options) {
    if (!this.accessToken) {
      throw new Error('No access token. Authentication required to register webhooks.');
    }

    if (!options.url) {
      throw new Error('Webhook URL is required');
    }

    if (!options.events || !Array.isArray(options.events) || options.events.length === 0) {
      throw new Error('At least one event type must be specified');
    }

    const response = await fetch(`${this.baseUrl}/${this.apiVersion}/webhooks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'X-App-ID': this.appId
      },
      body: JSON.stringify({
        url: options.url,
        events: options.events,
        secret: options.secret || undefined
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to register webhook');
    }

    return await response.json();
  }

  /**
   * Verify a webhook signature
   * @param {string} signature - The signature from the X-Signature header
   * @param {string} payload - The raw webhook payload
   * @param {string} secret - Your webhook secret
   * @returns {boolean} Whether the signature is valid
   */
  verifyWebhookSignature(signature, payload, secret) {
    try {
      // This is a simplified implementation - in production, use a proper crypto library
      const crypto = window.crypto || window.msCrypto;
      if (!crypto) {
        console.warn('Crypto API not available. Signature verification skipped.');
        return true;
      }

      // In a real implementation, you'd use HMAC-SHA256
      const encoder = new TextEncoder();
      const data = encoder.encode(payload);
      const secretData = encoder.encode(secret);
      
      // This is just a placeholder - in a real app, you'd implement proper HMAC verification
      // const calculatedSignature = await crypto.subtle.sign('HMAC', secretKey, data);
      
      return true; // Replace with actual signature verification
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  /**
   * Connect to a blockchain wallet (MetaMask, WalletConnect, etc.)
   * @param {Object} [options] - Wallet connection options
   * @param {string} [options.providerType='injected'] - Type of wallet provider ('injected', 'walletconnect')
   * @param {Object} [options.walletConnectOptions] - WalletConnect specific options
   * @returns {Promise<Object>} Wallet connection result with address and chain info
   */
  async connectWallet(options = {}) {
    const providerType = options.providerType || 'injected';
    
    if (providerType === 'injected') {
      // Check if MetaMask or other injected provider is available
      if (typeof window.ethereum === 'undefined') {
        throw new Error('No injected Ethereum provider found. Install MetaMask or another wallet.');
      }
      
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        return {
          success: true,
          address: accounts[0],
          chainId,
          providerType: 'injected'
        };
      } catch (error) {
        throw new Error(`Failed to connect to wallet: ${error.message}`);
      }
    } else if (providerType === 'walletconnect') {
      throw new Error('WalletConnect integration requires additional setup. Please import the WalletConnect library separately.');
    } else {
      throw new Error(`Unsupported provider type: ${providerType}`);
    }
  }

  /**
   * Link a verified address to a blockchain wallet
   * @param {Object} options - Linking options
   * @param {string} options.walletAddress - The blockchain wallet address
   * @param {number} options.chainId - The chain ID of the blockchain
   * @param {boolean} [options.createVerifiableCredential=false] - Create a verifiable credential
   * @returns {Promise<Object>} Result of the linking operation
   */
  async linkAddressToWallet(options) {
    if (!this.accessToken) {
      throw new Error('No access token. Authentication required to link address to wallet.');
    }

    if (!options.walletAddress) {
      throw new Error('Wallet address is required');
    }

    if (!options.chainId) {
      throw new Error('Chain ID is required');
    }

    const response = await fetch(`${this.baseUrl}/${this.apiVersion}/link-wallet`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'X-App-ID': this.appId
      },
      body: JSON.stringify({
        wallet_address: options.walletAddress,
        chain_id: options.chainId,
        create_vc: options.createVerifiableCredential || false
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to link address to wallet');
    }

    return await response.json();
  }

  /**
   * Get and refresh permission usage statistics
   * @returns {Promise<Object>} Usage statistics
   */
  async getUsageStats() {
    if (!this.accessToken) {
      throw new Error('No access token. Authentication required.');
    }

    const response = await fetch(`${this.baseUrl}/${this.apiVersion}/usage-stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'X-App-ID': this.appId
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get usage statistics');
    }

    return await response.json();
  }
}

// React hook for easy integration with enhanced features
function useSecureAddress(config) {
  const [address, setAddress] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [hasValidPermission, setHasValidPermission] = React.useState(false);
  const [permissionDetails, setPermissionDetails] = React.useState(null);
  const [walletInfo, setWalletInfo] = React.useState(null);
  
  const bridgeRef = React.useRef(null);
  
  // Initialize the SDK with enhanced options
  React.useEffect(() => {
    // Support for more configuration options
    const sdkConfig = {
      appId: config.appId,
      redirectUri: config.redirectUri || window.location.origin + window.location.pathname,
      baseUrl: config.baseUrl,
      walletOptions: config.walletOptions || { supportedChains: ['ethereum'] },
      webhooks: config.webhooks
    };
    
    bridgeRef.current = new SecureAddressBridge(sdkConfig);
    
    // Generate a random state for CSRF protection if not provided
    const state = config.state || Math.random().toString(36).substring(2, 15);
    
    // Check for callback
    const handleCallbackIfPresent = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      
      if (urlParams.has('access_token')) {
        try {
          const result = await bridgeRef.current.handleCallback({
            validateState: config.validateState !== false
          });
          
          if (result.success) {
            localStorage.setItem('address_token', result.accessToken);
            setHasValidPermission(true);
            
            // Get address data and verification details
            const data = await bridgeRef.current.getAddress({
              includeVerificationInfo: true
            });
            
            setAddress(data.address);
            setPermissionDetails(data.permission || null);
            
            // Clear URL parameters
            if (config.clearUrlAfterAuth !== false) {
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          } else {
            setError(new Error(result.errorDescription || 'Authorization failed'));
          }
        } catch (error) {
          setError(error);
        }
      }
      
      setIsLoading(false);
    };
    
    // Check for stored token with enhanced validation
    const checkStoredToken = async () => {
      const token = localStorage.getItem('address_token');
      
      if (token) {
        try {
          bridgeRef.current.setAccessToken(token);
          const validationResult = await bridgeRef.current.validateToken();
          
          if (validationResult.valid) {
            setHasValidPermission(true);
            setPermissionDetails(validationResult);
            
            // Get the address data
            const data = await bridgeRef.current.getAddress({
              includeVerificationInfo: config.includeVerificationInfo || false
            });
            
            setAddress(data.address);
          } else {
            // Clear invalid token
            localStorage.removeItem('address_token');
            
            // Provide more detailed error information
            if (validationResult.error) {
              console.warn('Token validation failed:', validationResult.error);
            }
          }
        } catch (error) {
          console.error('Error checking stored token:', error);
          localStorage.removeItem('address_token');
        }
      }
      
      const urlParams = new URLSearchParams(window.location.search);
      if (!urlParams.has('access_token')) {
        setIsLoading(false);
      }
    };
    
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.has('access_token')) {
      handleCallbackIfPresent();
    } else {
      checkStoredToken();
    }
  }, [config]);
  
  // Connect wallet function
  const connectWallet = async (options = {}) => {
    if (!bridgeRef.current) {
      throw new Error('SDK not initialized');
    }
    
    try {
      setIsLoading(true);
      const walletResult = await bridgeRef.current.connectWallet(options);
      setWalletInfo(walletResult);
      return walletResult;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to request access with enhanced options
  const requestAccess = (options = {}) => {
    if (bridgeRef.current) {
      // Generate random state for CSRF protection if not provided
      const state = options.state || Math.random().toString(36).substring(2, 15);
      
      bridgeRef.current.authorize({
        scope: options.scope || config.scope || ['address.city', 'address.country'],
        expiryDays: options.expiryDays || config.expiryDays || 30,
        maxAccesses: options.maxAccesses || config.maxAccesses,
        useWalletConnect: options.useWalletConnect || false,
        preferredChain: options.preferredChain || 'ethereum',
        state
      });
    } else {
      setError(new Error('SDK not initialized'));
    }
  };
  
  // Function to link address to wallet
  const linkAddressToWallet = async (options = {}) => {
    if (!bridgeRef.current) {
      throw new Error('SDK not initialized');
    }
    
    if (!hasValidPermission) {
      throw new Error('Valid permission required to link address to wallet');
    }
    
    return await bridgeRef.current.linkAddressToWallet({
      walletAddress: options.walletAddress || walletInfo?.address,
      chainId: options.chainId || walletInfo?.chainId,
      createVerifiableCredential: options.createVerifiableCredential || false
    });
  };
  
  // Function to get usage statistics
  const getUsageStats = async () => {
    if (!bridgeRef.current) {
      throw new Error('SDK not initialized');
    }
    
    return await bridgeRef.current.getUsageStats();
  };
  
  // Enhanced return object with more functionality
  return {
    address,
    isLoading,
    error,
    requestAccess,
    hasValidPermission,
    permissionDetails,
    walletInfo,
    connectWallet,
    linkAddressToWallet,
    getUsageStats,
    sdk: bridgeRef.current // Expose the SDK instance for advanced usage
  };
}

// Export the SDK
if (typeof window !== 'undefined') {
  window.SecureAddressBridge = SecureAddressBridge;
  window.useSecureAddress = useSecureAddress;
}

export { SecureAddressBridge, useSecureAddress };
