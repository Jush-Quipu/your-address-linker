
/**
 * SecureAddress Bridge JavaScript SDK
 * 
 * This SDK provides an easy way to integrate with SecureAddress Bridge
 * to securely access verified physical addresses.
 */

class SecureAddressBridge {
  /**
   * Initialize the SDK
   * @param {Object} config - Configuration options
   * @param {string} config.appId - Your application ID
   * @param {string} config.redirectUri - The URI to redirect to after authorization
   * @param {string} [config.baseUrl] - The base URL of the SecureAddress Bridge API
   */
  constructor(config) {
    this.appId = config.appId;
    this.redirectUri = config.redirectUri;
    this.baseUrl = config.baseUrl || 'https://api.secureaddress.bridge';
    this.accessToken = null;
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
   */
  authorize(options) {
    const scope = Array.isArray(options.scope) ? options.scope.join(' ') : options.scope;
    const expiryDays = options.expiryDays || 30;
    
    const params = new URLSearchParams({
      app_id: this.appId,
      redirect_uri: this.redirectUri,
      scope: scope,
      expiry_days: expiryDays
    });
    
    if (options.maxAccesses) {
      params.append('max_accesses', options.maxAccesses);
    }
    
    // Redirect to the authorization page
    window.location.href = `${this.baseUrl}/authorize?${params.toString()}`;
  }

  /**
   * Handle the callback from the authorization page
   * @returns {Promise<Object>} Result of the authorization
   */
  async handleCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const error = urlParams.get('error');
    
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
   * @returns {Promise<Object>} The user's address information
   */
  async getAddress(options = {}) {
    if (!this.accessToken) {
      throw new Error('No access token. Call handleCallback first or set the access token.');
    }
    
    let url = `${this.baseUrl}/v1/address`;
    
    // Add fields parameter if specified
    if (options.fields && Array.isArray(options.fields)) {
      const fieldsParam = options.fields.join(',');
      url += `?fields=${encodeURIComponent(fieldsParam)}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get address');
    }
    
    const data = await response.json();
    return data.address;
  }

  /**
   * Check if the access token is still valid
   * @returns {Promise<boolean>} True if the token is valid
   */
  async validateToken() {
    if (!this.accessToken) {
      return false;
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/v1/validate-token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }
}

// React hook for easy integration
function useSecureAddress(config) {
  const [address, setAddress] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [hasValidPermission, setHasValidPermission] = React.useState(false);
  
  const bridgeRef = React.useRef(null);
  
  // Initialize the SDK
  React.useEffect(() => {
    bridgeRef.current = new SecureAddressBridge({
      appId: config.appId,
      redirectUri: window.location.origin + window.location.pathname
    });
    
    // Check for callback
    const handleCallbackIfPresent = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      
      if (urlParams.has('access_token')) {
        try {
          const result = await bridgeRef.current.handleCallback();
          
          if (result.success) {
            localStorage.setItem('address_token', result.accessToken);
            setHasValidPermission(true);
            
            const addressData = await bridgeRef.current.getAddress();
            setAddress(addressData);
            
            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            setError(new Error(result.errorDescription || 'Authorization failed'));
          }
        } catch (error) {
          setError(error);
        }
      }
      
      setIsLoading(false);
    };
    
    // Check for stored token
    const checkStoredToken = async () => {
      const token = localStorage.getItem('address_token');
      
      if (token) {
        try {
          bridgeRef.current.setAccessToken(token);
          const isValid = await bridgeRef.current.validateToken();
          
          if (isValid) {
            setHasValidPermission(true);
            const addressData = await bridgeRef.current.getAddress();
            setAddress(addressData);
          } else {
            localStorage.removeItem('address_token');
          }
        } catch (error) {
          console.error('Error checking stored token:', error);
          localStorage.removeItem('address_token');
        }
      }
      
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
  }, [config.appId]);
  
  // Function to request access
  const requestAccess = () => {
    if (bridgeRef.current) {
      bridgeRef.current.authorize({
        scope: config.scope || ['address.city', 'address.country'],
        expiryDays: config.expiryDays || 30,
        maxAccesses: config.maxAccesses
      });
    }
  };
  
  return {
    address,
    isLoading,
    error,
    requestAccess,
    hasValidPermission
  };
}

// Export the SDK
if (typeof window !== 'undefined') {
  window.SecureAddressBridge = SecureAddressBridge;
  window.useSecureAddress = useSecureAddress;
}

export { SecureAddressBridge, useSecureAddress };
