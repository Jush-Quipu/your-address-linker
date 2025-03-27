
// Type definitions for SecureAddress Bridge SDK
export interface SecureAddressBridgeOptions {
  appId: string;
  redirectUri: string;
  sandbox?: boolean;
  sandboxOptions?: any;
  apiUrl?: string;
  apiKey?: string; // Added apiKey property
}

export interface AuthorizeOptions {
  scope: string[];
  state?: string;
  expiryDays?: number;
}

export interface AddressOptions {
  includeVerificationInfo?: boolean;
}

export interface WalletConnectionOptions {
  providerType: 'injected' | 'walletconnect' | 'coinbase';
}

export interface WalletLinkOptions {
  walletAddress: string;
  chainId: number;
  createVerifiableCredential?: boolean;
}

export interface ShippingTokenOptions {
  carriers: string[];
  shippingMethods: string[];
  requireConfirmation?: boolean;
  expiryDays?: number;
  maxUses?: number;
}

export interface ShipmentRequestOptions {
  shippingToken: string;
  carrier: string;
  service: string;
  package: {
    type: string;
    weight: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
  };
}

// Define SecureAddressBridge class on window
declare global {
  interface Window {
    SecureAddressBridge: any;
  }
}

// Export SecureAddressBridge for TypeScript
export class SecureAddressBridge {
  private appId: string;
  private redirectUri: string;
  private sandbox: boolean;
  private sandboxOptions: any;
  private apiUrl: string;
  private apiKey?: string; // Added apiKey property
  private accessToken: string | null = null;
  
  constructor(options: SecureAddressBridgeOptions) {
    this.appId = options.appId;
    this.redirectUri = options.redirectUri;
    this.sandbox = options.sandbox || false;
    this.sandboxOptions = options.sandboxOptions || {};
    this.apiUrl = options.apiUrl || 'https://api.secureaddress-bridge.com';
    this.apiKey = options.apiKey; // Initialize apiKey
  }
  
  setAccessToken(token: string | null) {
    this.accessToken = token;
  }
  
  getAccessToken(): string | null {
    return this.accessToken;
  }
  
  // This would typically handle the real SDK functionality
  // For now, we're just exposing the interface

  authorize(options: AuthorizeOptions) {
    console.log('SDK authorize called with', options);
    // Mock implementation for sandbox mode
    return { success: true };
  }

  handleCallback() {
    console.log('SDK handleCallback called');
    // Mock implementation for sandbox mode
    return { 
      success: true, 
      data: { 
        accessToken: 'mock_access_token_' + Math.random().toString(36).substring(2, 15) 
      } 
    };
  }

  linkAddressToWallet(addressId: string, walletAddress: string) {
    console.log('SDK linkAddressToWallet called with', { addressId, walletAddress });
    // Mock implementation for sandbox mode
    return { success: true };
  }
}
