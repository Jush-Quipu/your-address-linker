
import React from 'react';

export interface SecureAddressBridgeConfig {
  appId: string;
  redirectUri: string;
  baseUrl?: string;
  walletOptions?: {
    supportedChains?: string[];
  };
  webhooks?: {
    url?: string;
  };
  shipping?: {
    carriers?: string[];
  };
}

export interface AuthorizeOptions {
  scope: string[] | string;
  expiryDays?: number;
  maxAccesses?: number;
  useWalletConnect?: boolean;
  preferredChain?: string;
  state?: string;
}

export interface CallbackOptions {
  validateState?: boolean;
}

export interface GetAddressOptions {
  fields?: string[];
  includeVerificationInfo?: boolean;
}

export interface WebhookOptions {
  url: string;
  events: string[];
  secret?: string;
}

export interface WalletConnectionOptions {
  providerType?: 'injected' | 'walletconnect';
  walletConnectOptions?: Record<string, any>;
}

export interface LinkWalletOptions {
  walletAddress: string;
  chainId: string | number;
  createVerifiableCredential?: boolean;
}

export interface BlindShippingOptions {
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
    weight?: number;
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
    };
  };
}

export class SecureAddressBridge {
  constructor(config: SecureAddressBridgeConfig);
  setAccessToken(token: string): void;
  authorize(options: AuthorizeOptions): void;
  handleCallback(options?: CallbackOptions): Promise<{
    success: boolean;
    accessToken?: string;
    error?: string;
    errorDescription?: string;
  }>;
  getAddress(options?: GetAddressOptions): Promise<{
    address: Record<string, any>;
    verification?: Record<string, any>;
    permission?: Record<string, any>;
  }>;
  validateToken(): Promise<{
    valid: boolean;
    error?: string;
    status?: number;
  }>;
  registerWebhook(options: WebhookOptions): Promise<Record<string, any>>;
  verifyWebhookSignature(signature: string, payload: string, secret: string): boolean;
  connectWallet(options?: WalletConnectionOptions): Promise<{
    success: boolean;
    address: string;
    chainId: string;
    providerType: string;
  }>;
  linkAddressToWallet(options: LinkWalletOptions): Promise<Record<string, any>>;
  getUsageStats(): Promise<Record<string, any>>;
  createBlindShippingToken(options?: BlindShippingOptions): Promise<{
    shipping_token: string;
    expires_at: string;
    max_uses: number;
    remaining_uses: number;
  }>;
  requestShipment(options: ShipmentRequestOptions): Promise<Record<string, any>>;
  getTrackingInfo(trackingNumber: string, carrier: string): Promise<Record<string, any>>;
  confirmDelivery(trackingNumber: string, carrier: string): Promise<Record<string, any>>;
}

export interface UseSecureAddressConfig extends Omit<SecureAddressBridgeConfig, 'redirectUri'> {
  redirectUri?: string;
  includeVerificationInfo?: boolean;
  clearUrlAfterAuth?: boolean;
  validateState?: boolean;
  scope?: string[];
  expiryDays?: number;
  maxAccesses?: number;
  state?: string;
}

export interface UseSecureAddressResult {
  address: Record<string, any> | null;
  isLoading: boolean;
  error: Error | null;
  requestAccess: (options?: Partial<AuthorizeOptions>) => void;
  hasValidPermission: boolean;
  permissionDetails: Record<string, any> | null;
  walletInfo: {
    address: string;
    chainId: string;
    providerType: string;
  } | null;
  shippingToken: string | null;
  connectWallet: (options?: WalletConnectionOptions) => Promise<Record<string, any>>;
  linkAddressToWallet: (options?: Partial<LinkWalletOptions>) => Promise<Record<string, any>>;
  getUsageStats: () => Promise<Record<string, any>>;
  createBlindShippingToken: (options?: Partial<BlindShippingOptions>) => Promise<Record<string, any>>;
  requestShipment: (options: ShipmentRequestOptions) => Promise<Record<string, any>>;
  sdk: SecureAddressBridge | null;
}

export function useSecureAddress(config: UseSecureAddressConfig): UseSecureAddressResult;
