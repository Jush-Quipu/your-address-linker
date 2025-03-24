
/**
 * SecureAddress Bridge React Native SDK
 * 
 * This SDK provides a React Native implementation of the SecureAddress Bridge SDK
 * for securely accessing verified physical addresses with enhanced blockchain support
 * and blind shipping capabilities.
 * @version 1.2.0
 */

import { SecureAddressBridge } from '../secureaddress-bridge-sdk';
import React, { useState, useEffect, useRef } from 'react';
import { Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Enhanced SecureAddressBridge class for React Native
 */
class SecureAddressBridgeNative extends SecureAddressBridge {
  /**
   * Initialize the SDK
   * @param {Object} config - Configuration options
   */
  constructor(config) {
    super(config);
    this.asyncStorage = AsyncStorage;
    this.platform = Platform.OS;
  }

  /**
   * Redirect the user to the authorization page
   * @param {Object} options - Authorization options
   */
  authorize(options) {
    const scope = Array.isArray(options.scope) ? options.scope.join(' ') : options.scope;
    const expiryDays = options.expiryDays || 30;
    
    const params = new URLSearchParams({
      app_id: this.appId,
      redirect_uri: this.redirectUri,
      scope: scope,
      expiry_days: expiryDays,
      version: this.apiVersion,
      platform: this.platform
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
      this.asyncStorage.setItem('secureaddress_state', options.state);
    }
    
    const url = `${this.baseUrl}/authorize?${params.toString()}`;
    Linking.openURL(url);
  }

  /**
   * Handle the callback from the authorization page
   * @param {Object} [options] - Callback handling options
   * @returns {Promise<Object>} Result of the authorization
   */
  async handleCallback(options = { validateState: true }) {
    const url = await Linking.getInitialURL();
    
    if (!url) {
      return {
        success: false,
        error: 'missing_url',
        errorDescription: 'No URL found in the callback'
      };
    }
    
    const urlObj = new URL(url);
    const urlParams = new URLSearchParams(urlObj.search);
    
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
      const storedState = await this.asyncStorage.getItem('secureaddress_state');
      if (state !== storedState) {
        return {
          success: false,
          error: 'invalid_state',
          errorDescription: 'State parameter does not match the one sent in the request'
        };
      }
      await this.asyncStorage.removeItem('secureaddress_state');
    }
    
    this.accessToken = accessToken;
    
    return {
      success: true,
      accessToken: accessToken
    };
  }

  /**
   * Store or retrieve data from AsyncStorage
   * @param {string} key - The key to store/retrieve
   * @param {string} [value] - The value to store (if provided)
   * @returns {Promise<string|null>} The stored value or null
   */
  async storage(key, value) {
    if (value !== undefined) {
      await this.asyncStorage.setItem(key, value);
      return value;
    }
    
    return await this.asyncStorage.getItem(key);
  }

  /**
   * Connect to a blockchain wallet (WalletConnect for mobile)
   * @param {Object} [options] - Wallet connection options
   * @returns {Promise<Object>} Wallet connection result
   */
  async connectWallet(options = {}) {
    const providerType = options.providerType || 'walletconnect';
    
    if (providerType === 'walletconnect') {
      console.warn('WalletConnect integration requires the @walletconnect/react-native-dapp package');
      throw new Error('WalletConnect integration requires additional setup. Please import the WalletConnect library separately.');
    } else {
      throw new Error(`Unsupported provider type for React Native: ${providerType}`);
    }
  }

  /**
   * Request camera permissions for document scanning (if applicable)
   * @returns {Promise<boolean>} Whether permission was granted
   */
  async requestCameraPermission() {
    try {
      if (Platform.OS === 'android') {
        const { PermissionsAndroid } = require('react-native');
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "SecureAddress Bridge needs access to your camera to scan verification documents",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else if (Platform.OS === 'ios') {
        // For iOS we would use a different approach
        return true; // Placeholder for iOS implementation
      }
      return false;
    } catch (err) {
      console.warn('Error requesting camera permission:', err);
      return false;
    }
  }
}

/**
 * React hook for using SecureAddress Bridge in React Native
 * @param {Object} config - SDK configuration
 * @returns {Object} Hook return values and functions
 */
function useSecureAddressNative(config) {
  const [address, setAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasValidPermission, setHasValidPermission] = useState(false);
  const [permissionDetails, setPermissionDetails] = useState(null);
  const [walletInfo, setWalletInfo] = useState(null);
  const [shippingToken, setShippingToken] = useState(null);
  
  const bridgeRef = useRef(null);
  
  useEffect(() => {
    const sdkConfig = {
      appId: config.appId,
      redirectUri: config.redirectUri || '',
      baseUrl: config.baseUrl,
      walletOptions: config.walletOptions || { supportedChains: ['ethereum'] },
      webhooks: config.webhooks,
      shipping: config.shipping || { 
        carriers: ['usps', 'fedex', 'ups'] 
      }
    };
    
    bridgeRef.current = new SecureAddressBridgeNative(sdkConfig);
    
    const state = config.state || Math.random().toString(36).substring(2, 15);
    
    const setupURLListener = () => {
      // Add event listener to handle app being opened from URL
      const urlListener = Linking.addEventListener('url', async (event) => {
        if (!event.url) return;
        
        const url = new URL(event.url);
        const urlParams = new URLSearchParams(url.search);
        
        if (urlParams.has('access_token')) {
          try {
            setIsLoading(true);
            const result = await bridgeRef.current.handleCallback({
              validateState: config.validateState !== false
            });
            
            if (result.success) {
              await AsyncStorage.setItem('address_token', result.accessToken);
              setHasValidPermission(true);
              
              const data = await bridgeRef.current.getAddress({
                includeVerificationInfo: true
              });
              
              setAddress(data.address);
              setPermissionDetails(data.permission || null);
            } else {
              setError(new Error(result.errorDescription || 'Authorization failed'));
            }
          } catch (error) {
            setError(error);
          } finally {
            setIsLoading(false);
          }
        }
      });

      return () => {
        urlListener.remove();
      };
    };
    
    const checkStoredToken = async () => {
      try {
        const token = await AsyncStorage.getItem('address_token');
        
        if (token) {
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
            await AsyncStorage.removeItem('address_token');
            
            if (validationResult.error) {
              console.warn('Token validation failed:', validationResult.error);
            }
          }
        }
      } catch (error) {
        console.error('Error checking stored token:', error);
        await AsyncStorage.removeItem('address_token');
      } finally {
        setIsLoading(false);
      }
    };
    
    const cleanup = setupURLListener();
    checkStoredToken();
    
    return cleanup;
  }, [config]);
  
  const requestAccess = (options = {}) => {
    if (bridgeRef.current) {
      const state = options.state || Math.random().toString(36).substring(2, 15);
      
      bridgeRef.current.authorize({
        scope: options.scope || config.scope || ['street', 'city', 'state', 'postal_code', 'country'],
        expiryDays: options.expiryDays || config.expiryDays || 30,
        maxAccesses: options.maxAccesses || config.maxAccesses,
        useWalletConnect: options.useWalletConnect !== undefined ? options.useWalletConnect : true,
        preferredChain: options.preferredChain || 'ethereum',
        state
      });
    } else {
      setError(new Error('SDK not initialized'));
    }
  };
  
  const clearStoredData = async () => {
    try {
      await AsyncStorage.removeItem('address_token');
      await AsyncStorage.removeItem('secureaddress_state');
      setAddress(null);
      setHasValidPermission(false);
      setPermissionDetails(null);
      setWalletInfo(null);
      setShippingToken(null);
    } catch (error) {
      console.error('Error clearing stored data:', error);
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
    clearStoredData,
    sdk: bridgeRef.current
  };
}

export { SecureAddressBridgeNative, useSecureAddressNative };
