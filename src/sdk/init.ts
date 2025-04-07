
import { SecureAddressBridge } from './secureaddress-bridge-sdk';

// Initialize the SDK once and make it available globally
export function initSecureAddressBridge() {
  try {
    if (!window.SecureAddressBridge) {
      console.log('Initializing SecureAddressBridge SDK');
      
      // Create a singleton instance
      const sdkInstance = new SecureAddressBridge({
        appId: 'secure-address-bridge-app',
        apiUrl: 'https://sandbox.secureaddress-bridge.com/api',
        redirectUri: `${window.location.origin}/auth/callback`
      });
      
      // Make it available globally
      window.SecureAddressBridge = sdkInstance;
      console.log('SecureAddressBridge SDK initialized successfully');
    }
    
    return window.SecureAddressBridge;
  } catch (error) {
    console.error('Error initializing SecureAddressBridge SDK:', error);
    throw error;
  }
}

// Automatically initialize when imported
initSecureAddressBridge();

// Export the singleton instance
export const secureAddressBridge = window.SecureAddressBridge;
