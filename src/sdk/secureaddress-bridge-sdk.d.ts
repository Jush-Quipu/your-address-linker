
export interface SandboxOptions {
  responseDelay?: number;
  simulateErrors?: boolean;
  errorRate?: number;
  verificationSuccess?: boolean;
  walletConnectionSuccess?: boolean;
  mockAddress?: {
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    verified?: boolean;
    verification_method?: string;
    verification_date?: string;
  };
  mockShipping?: {
    carriers?: string[];
    available?: boolean;
    trackingAvailable?: boolean;
  };
}

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
  sandbox?: boolean;
  sandboxOptions?: SandboxOptions;
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
  setAccessToken(token: string | null): void;
  authorize(options: AuthorizeOptions): any;
  handleCallback(options?: CallbackOptions): Promise<{
    success: boolean;
    data?: { accessToken: string };
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
  linkAddressToWallet(addressId: string, walletAddress: string): Promise<{
    success: boolean;
    error?: string;
  }>;
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
  configureSandbox(config: SandboxOptions): SandboxOptions | null;
  resetSandbox(): SandboxOptions | null;
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
