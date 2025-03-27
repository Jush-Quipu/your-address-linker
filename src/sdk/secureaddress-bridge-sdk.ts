
// Type definitions for SecureAddress Bridge SDK
export interface SecureAddressBridgeOptions {
  appId: string;
  redirectUri: string;
  sandbox?: boolean;
  sandboxOptions?: any;
  apiUrl?: string;
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
  private accessToken: string | null = null;
  
  constructor(options: SecureAddressBridgeOptions) {
    this.appId = options.appId;
    this.redirectUri = options.redirectUri;
    this.sandbox = options.sandbox || false;
    this.sandboxOptions = options.sandboxOptions || {};
    this.apiUrl = options.apiUrl || 'https://api.secureaddress-bridge.com';
  }
  
  setAccessToken(token: string) {
    this.accessToken = token;
  }
  
  getAccessToken(): string | null {
    return this.accessToken;
  }
  
  // This would typically handle the real SDK functionality
  // For now, we're just exposing the interface
}
