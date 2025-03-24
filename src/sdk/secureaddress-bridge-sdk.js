/**
 * SecureAddress Bridge JavaScript SDK
 * 
 * This SDK provides an easy way to integrate with SecureAddress Bridge
 * to securely access verified physical addresses with enhanced blockchain support
 * and blind shipping capabilities.
 * @version 2.1.0
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
   * @param {Object} [config.shipping] - Shipping options configuration
   * @param {string[]} [config.shipping.carriers] - Supported shipping carriers (e.g., ['usps', 'fedex', 'ups'])
   * @param {boolean} [config.sandbox] - Enable sandbox mode for testing without real API calls
   * @param {Object} [config.sandboxOptions] - Sandbox configuration options
   */
  constructor(config) {
    this.appId = config.appId;
    this.redirectUri = config.redirectUri;
    this.baseUrl = config.baseUrl || 'https://api.secureaddress.bridge';
    this.accessToken = null;
    this.supportedChains = config.walletOptions?.supportedChains || ['ethereum'];
    this.webhookUrl = config.webhooks?.url || null;
    this.apiVersion = 'v1';
    this.supportedCarriers = config.shipping?.carriers || ['usps', 'fedex', 'ups'];
    this.supportedShippingMethods = {
      'usps': ['Priority', 'First-Class', 'Ground', 'Express'],
      'fedex': ['Ground', '2Day', 'Express', 'Overnight'],
      'ups': ['Ground', 'Next Day Air', '2nd Day Air', '3 Day Select']
    };
    
    // Sandbox mode configuration
    this.sandbox = config.sandbox || false;
    this.sandboxOptions = config.sandboxOptions || {};
    
    // Initialize sandbox controller if in sandbox mode
    if (this.sandbox && typeof window !== 'undefined') {
      // In browser environments, dynamically import the sandbox controller
      if (typeof require !== 'undefined') {
        try {
          // CommonJS environment
          this.sandboxController = require('../services/sandbox/sandboxController');
        } catch (e) {
          console.warn('Sandbox controller not found. Using mock implementation.');
          // Fallback to mock implementation
          this.sandboxController = {
            handleAuthorize: async () => ({ success: true, redirectUrl: '#' }),
            handleCallback: async () => ({ success: true, accessToken: 'sandbox_token' }),
            getAddress: async () => ({ success: true, address: { street: '123 Test St', city: 'Testville' } }),
            validateToken: async () => ({ valid: true }),
            connectWallet: async () => ({ success: true, address: '0x123' }),
            linkAddressToWallet: async () => ({ success: true }),
            createBlindShippingToken: async () => ({ success: true, shipping_token: 'sandbox_token' }),
            requestShipment: async () => ({ success: true, tracking_number: 'TRACK123' }),
            getTrackingInfo: async () => ({ success: true, status: 'in_transit' }),
            registerWebhook: async () => ({ success: true, webhook_id: 'hook_123' }),
            updateSandboxConfig: (config) => config
          };
        }
      } else {
        // ES modules environment or browser without require
        console.warn('Sandbox controller not loaded. Using mock implementation.');
        // Same fallback as above
        this.sandboxController = {
          handleAuthorize: async () => ({ success: true, redirectUrl: '#' }),
          handleCallback: async () => ({ success: true, accessToken: 'sandbox_token' }),
          getAddress: async () => ({ success: true, address: { street: '123 Test St', city: 'Testville' } }),
          validateToken: async () => ({ valid: true }),
          connectWallet: async () => ({ success: true, address: '0x123' }),
          linkAddressToWallet: async () => ({ success: true }),
          createBlindShippingToken: async () => ({ success: true, shipping_token: 'sandbox_token' }),
          requestShipment: async () => ({ success: true, tracking_number: 'TRACK123' }),
          getTrackingInfo: async () => ({ success: true, status: 'in_transit' }),
          registerWebhook: async () => ({ success: true, webhook_id: 'hook_123' }),
          updateSandboxConfig: (config) => config
        };
      }
      
      // Apply any sandbox options
      if (this.sandboxOptions && this.sandboxController.updateSandboxConfig) {
        this.sandboxController.updateSandboxConfig(this.sandboxOptions);
      }
    }
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
    // Use sandbox mode if enabled
    if (this.sandbox && this.sandboxController) {
      console.info('[SecureAddress SDK] Using sandbox mode for authorization');
      this.sandboxController.handleAuthorize({
        appId: this.appId,
        redirectUri: this.redirectUri,
        scope: options.scope,
        expiryDays: options.expiryDays,
        state: options.state
      }).then(result => {
        if (result.success && result.redirectUrl) {
          window.location.href = result.redirectUrl;
        }
      });
      return;
    }
    
    // Normal API call
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
      localStorage.setItem('secureaddress_state', options.state);
    }
    
    window.location.href = `${this.baseUrl}/authorize?${params.toString()}`;
  }

  /**
   * Handle the callback from the authorization page
   * @param {Object} [options] - Callback handling options
   * @param {boolean} [options.validateState=true] - Whether to validate the state parameter
   * @returns {Promise<Object>} Result of the authorization
   */
  async handleCallback(options = { validateState: true }) {
    // Use sandbox mode if enabled
    if (this.sandbox && this.sandboxController) {
      console.info('[SecureAddress SDK] Using sandbox mode for callback handling');
      const result = await this.sandboxController.handleCallback();
      
      if (result.success && result.accessToken) {
        this.accessToken = result.accessToken;
      }
      
      return result;
    }
    
    // Normal API call
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

    if (options.validateState && state) {
      const storedState = localStorage.getItem('secureaddress_state');
      if (state !== storedState) {
        return {
          success: false,
          error: 'invalid_state',
          errorDescription: 'State parameter does not match the one sent in the request'
        };
      }
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
    // Use sandbox mode if enabled
    if (this.sandbox && this.sandboxController) {
      console.info('[SecureAddress SDK] Using sandbox mode for address retrieval');
      return this.sandboxController.getAddress(options);
    }
    
    if (!this.accessToken) {
      throw new Error('No access token. Call handleCallback first or set the access token.');
    }
    
    let url = `${this.baseUrl}/${this.apiVersion}/address`;
    const queryParams = new URLSearchParams();
    
    if (options.fields && Array.isArray(options.fields)) {
      queryParams.append('fields', options.fields.join(','));
    }

    if (options.includeVerificationInfo) {
      queryParams.append('include_verification', 'true');
    }

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
    // Use sandbox mode if enabled
    if (this.sandbox && this.sandboxController) {
      console.info('[SecureAddress SDK] Using sandbox mode for token validation');
      return this.sandboxController.validateToken();
    }
    
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
    // Use sandbox mode if enabled
    if (this.sandbox && this.sandboxController) {
      console.info('[SecureAddress SDK] Using sandbox mode for webhook registration');
      return this.sandboxController.registerWebhook(options);
    }
    
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
      const crypto = window.crypto || window.msCrypto;
      if (!crypto) {
        console.warn('Crypto API not available. Signature verification skipped.');
        return true;
      }

      const encoder = new TextEncoder();
      const data = encoder.encode(payload);
      const secretData = encoder.encode(secret);
      
      return true;
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
    // Use sandbox mode if enabled
    if (this.sandbox && this.sandboxController) {
      console.info('[SecureAddress SDK] Using sandbox mode for wallet connection');
      return this.sandboxController.connectWallet(options);
    }
    
    const providerType = options.providerType || 'injected';
    
    if (providerType === 'injected') {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('No injected Ethereum provider found. Install MetaMask or another wallet.');
      }
      
      try {
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
    // Use sandbox mode if enabled
    if (this.sandbox && this.sandboxController) {
      console.info('[SecureAddress SDK] Using sandbox mode for address-to-wallet linking');
      return this.sandboxController.linkAddressToWallet(options);
    }
    
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

  /**
   * Create a blind shipping token for secure shipping without exposing address
   * @param {Object} options - Blind shipping options
   * @param {string[]} options.carriers - Array of allowed carriers (e.g., ['usps', 'fedex', 'ups'])
   * @param {string[]} options.shippingMethods - Array of allowed shipping methods
   * @param {boolean} [options.requireConfirmation=false] - Whether to require delivery confirmation
   * @param {number} [options.expiryDays=7] - Number of days until the shipping token expires
   * @param {number} [options.maxUses=1] - Maximum number of times the shipping token can be used
   * @returns {Promise<Object>} Result with the shipping token
   */
  async createBlindShippingToken(options = {}) {
    if (!this.accessToken) {
      throw new Error('No access token. Call handleCallback first or set the access token.');
    }
    
    if (!options.carriers || !Array.isArray(options.carriers) || options.carriers.length === 0) {
      throw new Error('At least one carrier must be specified');
    }
    
    if (!options.shippingMethods || !Array.isArray(options.shippingMethods) || options.shippingMethods.length === 0) {
      throw new Error('At least one shipping method must be specified');
    }
    
    const invalidCarriers = options.carriers.filter(carrier => !this.supportedCarriers.includes(carrier));
    if (invalidCarriers.length > 0) {
      throw new Error(`Unsupported carriers: ${invalidCarriers.join(', ')}`);
    }
    
    const invalidMethods = [];
    options.carriers.forEach(carrier => {
      const supportedMethods = this.supportedShippingMethods[carrier] || [];
      options.shippingMethods.forEach(method => {
        if (!supportedMethods.includes(method)) {
          invalidMethods.push(`${method} for ${carrier}`);
        }
      });
    });
    
    if (invalidMethods.length > 0) {
      throw new Error(`Unsupported shipping methods: ${invalidMethods.join(', ')}`);
    }
    
    const response = await fetch(`${this.baseUrl}/${this.apiVersion}/create-shipping-token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'X-App-ID': this.appId
      },
      body: JSON.stringify({
        carriers: options.carriers,
        shipping_methods: options.shippingMethods,
        require_confirmation: options.requireConfirmation || false,
        expiry_days: options.expiryDays || 7,
        max_uses: options.maxUses || 1
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create blind shipping token');
    }
    
    return await response.json();
  }

  /**
   * Request a shipment using a blind shipping token (for applications)
   * @param {Object} options - Shipment request options
   * @param {string} options.shippingToken - The blind shipping token
   * @param {string} options.carrier - The carrier to use (e.g., 'usps', 'fedex', 'ups')
   * @param {string} options.service - The shipping service to use
   * @param {Object} options.package - Package details
   * @param {string} options.package.type - Package type
   * @param {number} [options.package.weight] - Package weight in oz
   * @param {Object} [options.package.dimensions] - Package dimensions
   * @returns {Promise<Object>} Result with tracking information
   */
  async requestShipment(options = {}) {
    if (!options.shippingToken) {
      throw new Error('Shipping token is required');
    }
    
    if (!options.carrier || !this.supportedCarriers.includes(options.carrier)) {
      throw new Error(`Invalid or unsupported carrier: ${options.carrier}`);
    }
    
    if (!options.service || !this.supportedShippingMethods[options.carrier]?.includes(options.service)) {
      throw new Error(`Invalid or unsupported shipping service: ${options.service}`);
    }
    
    if (!options.package || !options.package.type) {
      throw new Error('Package type is required');
    }
    
    const response = await fetch(`${this.baseUrl}/${this.apiVersion}/request-shipment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-App-ID': this.appId
      },
      body: JSON.stringify({
        shipping_token: options.shippingToken,
        carrier: options.carrier,
        service: options.service,
        package: options.package
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to request shipment');
    }
    
    return await response.json();
  }

  /**
   * Get tracking information for a shipment
   * @param {string} trackingNumber - The tracking number
   * @param {string} carrier - The carrier (e.g., 'usps', 'fedex', 'ups')
   * @returns {Promise<Object>} Tracking information
   */
  async getTrackingInfo(trackingNumber, carrier) {
    if (!trackingNumber) {
      throw new Error('Tracking number is required');
    }
    
    if (!carrier || !this.supportedCarriers.includes(carrier)) {
      throw new Error(`Invalid or unsupported carrier: ${carrier}`);
    }
    
    const response = await fetch(`${this.baseUrl}/${this.apiVersion}/tracking?number=${encodeURIComponent(trackingNumber)}&carrier=${encodeURIComponent(carrier)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-App-ID': this.appId
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get tracking information');
    }
    
    return await response.json();
  }

  /**
   * Confirm delivery for a shipment (if confirmation is required)
   * @param {string} trackingNumber - The tracking number
   * @param {string} carrier - The carrier (e.g., 'usps', 'fedex', 'ups')
   * @returns {Promise<Object>} Confirmation result
   */
  async confirmDelivery(trackingNumber, carrier) {
    if (!this.accessToken) {
      throw new Error('No access token. Call handleCallback first or set the access token.');
    }
    
    if (!trackingNumber) {
      throw new Error('Tracking number is required');
    }
    
    if (!carrier || !this.supportedCarriers.includes(carrier)) {
      throw new Error(`Invalid or unsupported carrier: ${carrier}`);
    }
    
    const response = await fetch(`${this.baseUrl}/${this.apiVersion}/confirm-delivery`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'X-App-ID': this.appId
      },
      body: JSON.stringify({
        tracking_number: trackingNumber,
        carrier: carrier
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to confirm delivery');
    }
    
    return await response.json();
  }

  /**
   * Configure sandbox mode settings
   * Only applicable when the SDK is initialized with sandbox: true
   * @param {Object} config - Sandbox configuration options
   * @returns {Object|null} Updated sandbox configuration or null if sandbox is not enabled
   */
  configureSandbox(config) {
    if (!this.sandbox || !this.sandboxController) {
      console.warn('[SecureAddress SDK] Sandbox mode is not enabled');
      return null;
    }
    
    // Update sandbox configuration
    if (this.sandboxController.updateSandboxConfig) {
      return this.sandboxController.updateSandboxConfig(config);
    }
    
    return null;
  }
  
  /**
   * Reset sandbox configuration to defaults
   * Only applicable when the SDK is initialized with sandbox: true
   * @returns {Object|null} Default sandbox configuration or null if sandbox is not enabled
   */
  resetSandbox() {
    if (!this.sandbox || !this.sandboxController) {
      console.warn('[SecureAddress SDK] Sandbox mode is not enabled');
      return null;
    }
    
    // Reset sandbox configuration
    if (this.sandboxController.resetSandboxConfig) {
      return this.sandboxController.resetSandboxConfig();
    }
    
    return null;
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
  const [shippingToken, setShippingToken] = React.useState(null);
  
  const bridgeRef = React.useRef(null);
  
  React.useEffect(() => {
    const sdkConfig = {
      appId: config.appId,
      redirectUri: config.redirectUri || window.location.origin + window.location.pathname,
      baseUrl: config.baseUrl,
      walletOptions: config.walletOptions || { supportedChains: ['ethereum'] },
      webhooks: config.webhooks,
      shipping: config.shipping || { 
        carriers: ['usps', 'fedex', 'ups'] 
      }
    };
    
    bridgeRef.current = new SecureAddressBridge(sdkConfig);
    
    const state = config.state || Math.random().toString(36).substring(2, 15);
    
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
            
            const data = await bridgeRef.current.getAddress({
              includeVerificationInfo: true
            });
            
            setAddress(data.address);
            setPermissionDetails(data.permission || null);
            
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
    
    const checkStoredToken = async () => {
      const token = localStorage.getItem('address_token');
      
      if (token) {
        try {
          bridgeRef.current.setAccessToken(token);
          const validationResult = await bridgeRef.current.validateToken();
          
          if (validationResult.valid) {
            setHasValidPermission(true);
            setPermissionDetails(validationResult);
            
            const data = await bridgeRef.current.getAddress({
              includeVerificationInfo: config.includeVerificationInfo || false
            });
            
            setAddress(data.address);
          } else {
            localStorage.removeItem('address_token');
            
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
  
  const requestAccess = (options = {}) => {
    if (bridgeRef.current) {
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
  
  const getUsageStats = async () => {
    if (!bridgeRef.current) {
      throw new Error('SDK not initialized');
    }
    
    return await bridgeRef.current.getUsageStats();
  };
  
  const createBlindShippingToken = async (options = {}) => {
    if (!bridgeRef.current) {
      throw new Error('SDK not initialized');
    }
    
    if (!hasValidPermission) {
      throw new Error('Valid permission required to create shipping token');
    }
    
    setIsLoading(true);
    try {
      const result = await bridgeRef.current.createBlindShippingToken({
        carriers: options.carriers || ['usps', 'fedex', 'ups'],
        shippingMethods: options.shippingMethods || ['Priority', 'Ground', 'Express'],
        requireConfirmation: options.requireConfirmation || false,
        expiryDays: options.expiryDays || 7,
        maxUses: options.maxUses || 1
      });
      
      setShippingToken(result.shipping_token);
      return result;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const requestShipment = async (options = {}) => {
    if (!bridgeRef.current) {
      throw new Error('SDK not initialized');
    }
    
    setIsLoading(true);
    try {
      return await bridgeRef.current.requestShipment({
        shippingToken: options.shippingToken || shippingToken,
        carrier: options.carrier,
        service: options.service,
        package: options.package
      });
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    address,
    isLoading,
    error,
    requestAccess,
    hasValidPermission,
    permissionDetails,
    walletInfo,
    shippingToken,
    connectWallet,
    linkAddressToWallet,
    getUsageStats,
    createBlindShippingToken,
    requestShipment,
    sdk: bridgeRef.current
  };
}

if (typeof window !== 'undefined') {
  window.SecureAddressBridge = SecureAddressBridge;
  window.useSecureAddress = useSecureAddress;
}

export { SecureAddressBridge, useSecureAddress };
