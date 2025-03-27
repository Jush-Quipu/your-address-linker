
// Sandbox environment types

export interface SandboxConfig {
  responseDelay: number;
  simulateErrors: boolean;
  errorRate: number;
  verificationSuccess: boolean;
  walletConnectionSuccess: boolean;
  mockAddress: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    verification_method: string;
    verified_at: string;
  };
  mockShipping: {
    available: boolean;
    trackingAvailable: boolean;
    carriers: string[];
    shippingMethods: string[];
  };
  mockWallet: {
    address: string;
    chainId: number;
    network: string;
  };
}

export interface SandboxResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

export interface AddressResponse {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  verification_status?: string;
  verification_method?: string;
  verified_at?: string;
}

export interface WalletResponse {
  address: string;
  chainId: number;
  network: string;
  connected: boolean;
}

export interface ShippingTokenResponse {
  shipping_token: string;
  expires_at: string;
  available_carriers: string[];
  available_methods: string[];
  max_uses: number;
}

export interface ShipmentResponse {
  tracking_number: string;
  label_url: string;
  carrier: string;
  service: string;
  estimated_delivery: string;
}

export interface TrackingResponse {
  tracking_number: string;
  carrier: string;
  status: 'created' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception';
  estimated_delivery: string;
  tracking_events: {
    timestamp: string;
    status: string;
    location: string;
    description: string;
  }[];
}

export interface SandboxOptions {
  // Configuration options for the sandbox environment
  verificationSuccess?: boolean;
  mockResponses?: Record<string, any>;
  walletData?: {
    address?: string;
    chainId?: number;
    network?: string;
  };
  addressData?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}
