
import { SandboxConfig, SandboxResponse, AddressResponse, WalletResponse, ShippingTokenResponse, ShipmentResponse, TrackingResponse } from '@/types/sandbox';

// Default sandbox configuration
const DEFAULT_CONFIG: SandboxConfig = {
  responseDelay: 300,
  simulateErrors: false,
  errorRate: 0.1,
  verificationSuccess: true,
  walletConnectionSuccess: true,
  mockAddress: {
    street: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    postal_code: '94105',
    country: 'USA',
    verification_method: 'document_upload',
    verified_at: new Date().toISOString()
  },
  mockShipping: {
    available: true,
    trackingAvailable: true,
    carriers: ['usps', 'fedex', 'ups'],
    shippingMethods: ['Standard', 'Express', 'Priority']
  },
  mockWallet: {
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    chainId: 1,
    network: 'ethereum'
  }
};

// Current configuration (starts with defaults)
let currentConfig: SandboxConfig = { ...DEFAULT_CONFIG };

// Simulates network delay and randomly generates errors based on config
async function simulateResponse<T>(responseData: T): Promise<SandboxResponse<T>> {
  // Wait for the configured delay
  await new Promise(resolve => setTimeout(resolve, currentConfig.responseDelay));
  
  // Determine if we should simulate an error
  if (currentConfig.simulateErrors && Math.random() < currentConfig.errorRate) {
    const errors = [
      { code: 'auth_error', message: 'Authentication failed' },
      { code: 'rate_limit', message: 'Rate limit exceeded' },
      { code: 'validation_error', message: 'Invalid request parameters' },
      { code: 'server_error', message: 'Internal server error' },
      { code: 'network_error', message: 'Network connectivity issue' }
    ];
    
    const randomError = errors[Math.floor(Math.random() * errors.length)];
    
    return {
      success: false,
      error: randomError,
      timestamp: new Date().toISOString()
    };
  }
  
  // Return successful response
  return {
    success: true,
    data: responseData,
    timestamp: new Date().toISOString()
  };
}

// Get the current sandbox configuration
export function getSandboxConfig(): SandboxConfig {
  return { ...currentConfig };
}

// Update the sandbox configuration
export function updateSandboxConfig(config: Partial<SandboxConfig>): SandboxConfig {
  currentConfig = {
    ...currentConfig,
    ...config,
    mockAddress: {
      ...currentConfig.mockAddress,
      ...(config.mockAddress || {})
    },
    mockShipping: {
      ...currentConfig.mockShipping,
      ...(config.mockShipping || {})
    },
    mockWallet: {
      ...currentConfig.mockWallet,
      ...(config.mockWallet || {})
    }
  };
  
  return { ...currentConfig };
}

// Reset sandbox configuration to defaults
export function resetSandboxConfig(): SandboxConfig {
  currentConfig = { ...DEFAULT_CONFIG };
  return { ...currentConfig };
}

// Handle authorization request
export async function handleAuthorize(params: {
  appId: string;
  redirectUri: string;
  scope: string[];
  expiryDays?: number;
  state?: string;
}): Promise<SandboxResponse<{ code: string; state: string }>> {
  const authCode = `auth_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  
  return simulateResponse({
    code: authCode,
    state: params.state || 'state123'
  });
}

// Handle callback with code exchange
export async function handleCallback(): Promise<SandboxResponse<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  scope: string[];
}>> {
  const accessToken = `access_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  const refreshToken = `refresh_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  
  return simulateResponse({
    accessToken,
    refreshToken,
    expiresIn: 3600,
    tokenType: 'Bearer',
    scope: ['read:profile', 'read:address']
  });
}

// Get address information
export async function getAddress(params: {
  includeVerificationInfo?: boolean;
}): Promise<SandboxResponse<AddressResponse>> {
  if (!currentConfig.verificationSuccess) {
    return simulateResponse({
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      verification_status: 'pending',
      verification_method: ''
    });
  }
  
  const addressData: AddressResponse = {
    ...currentConfig.mockAddress,
    verification_status: 'verified'
  };
  
  if (!params.includeVerificationInfo) {
    delete addressData.verification_method;
    delete addressData.verified_at;
  }
  
  return simulateResponse(addressData);
}

// Connect to wallet
export async function connectWallet(params: {
  providerType: 'injected' | 'walletconnect' | 'coinbase';
}): Promise<SandboxResponse<WalletResponse>> {
  if (!currentConfig.walletConnectionSuccess) {
    return simulateResponse({
      address: '',
      chainId: 0,
      network: '',
      connected: false
    });
  }
  
  return simulateResponse({
    ...currentConfig.mockWallet,
    connected: true
  });
}

// Link address to wallet
export async function linkAddressToWallet(params: {
  walletAddress: string;
  chainId: number;
  createVerifiableCredential?: boolean;
}): Promise<SandboxResponse<{
  linked: boolean;
  verifiable_credential?: {
    id: string;
    type: string;
    proof: string;
  };
}>> {
  if (!currentConfig.verificationSuccess) {
    return simulateResponse({
      linked: false
    });
  }
  
  const response: any = { linked: true };
  
  if (params.createVerifiableCredential) {
    response.verifiable_credential = {
      id: `vc_${Date.now()}`,
      type: 'AddressCredential',
      proof: `proof_${Math.random().toString(36).substring(2)}`
    };
  }
  
  return simulateResponse(response);
}

// Create blind shipping token
export async function createBlindShippingToken(params: {
  carriers: string[];
  shippingMethods: string[];
  requireConfirmation?: boolean;
  expiryDays?: number;
  maxUses?: number;
}): Promise<SandboxResponse<ShippingTokenResponse>> {
  if (!currentConfig.mockShipping.available) {
    return simulateResponse({
      success: false,
      error: {
        code: 'shipping_unavailable',
        message: 'Shipping is not available for this address'
      },
      timestamp: new Date().toISOString()
    }) as any;
  }
  
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + (params.expiryDays || 30));
  
  return simulateResponse({
    shipping_token: `shipping_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    expires_at: expiry.toISOString(),
    available_carriers: params.carriers.filter(c => 
      currentConfig.mockShipping.carriers.includes(c)
    ),
    available_methods: params.shippingMethods.filter(m => 
      currentConfig.mockShipping.shippingMethods.includes(m)
    ),
    max_uses: params.maxUses || 1
  });
}

// Request shipment with token
export async function requestShipment(params: {
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
}): Promise<SandboxResponse<ShipmentResponse>> {
  if (!currentConfig.mockShipping.available || 
      !currentConfig.mockShipping.carriers.includes(params.carrier)) {
    return simulateResponse({
      success: false,
      error: {
        code: 'shipping_unavailable',
        message: `Carrier ${params.carrier} is not available for this address`
      },
      timestamp: new Date().toISOString()
    }) as any;
  }
  
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + (params.service === 'Express' ? 2 : 5));
  
  return simulateResponse({
    tracking_number: `${params.carrier.toUpperCase()}${Date.now().toString().substring(5)}`,
    label_url: `https://sandbox.secureaddress.example/labels/${params.carrier}/${Date.now()}.pdf`,
    carrier: params.carrier,
    service: params.service,
    estimated_delivery: deliveryDate.toISOString()
  });
}

// Get tracking info
export async function getTrackingInfo(
  trackingNumber: string,
  carrier: string
): Promise<SandboxResponse<TrackingResponse>> {
  if (!currentConfig.mockShipping.trackingAvailable || 
      !currentConfig.mockShipping.carriers.includes(carrier)) {
    return simulateResponse({
      success: false,
      error: {
        code: 'tracking_unavailable',
        message: 'Tracking is not available for this shipment'
      },
      timestamp: new Date().toISOString()
    }) as any;
  }
  
  const now = new Date();
  
  // Create some mock tracking events
  const events = [
    {
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      status: 'created',
      location: 'Shipping Origin',
      description: 'Shipping label created'
    },
    {
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
      status: 'in_transit',
      location: 'Shipping Hub',
      description: 'Package received at carrier facility'
    }
  ];
  
  // Randomly add a more recent event
  if (Math.random() > 0.5) {
    events.push({
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 12).toISOString(),
      status: 'in_transit',
      location: 'Local Facility',
      description: 'Package in transit to destination'
    });
  }
  
  // If we're really lucky, it's delivered
  if (Math.random() > 0.8) {
    events.push({
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(),
      status: 'delivered',
      location: 'Destination',
      description: 'Package delivered'
    });
  }
  
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  
  return simulateResponse({
    tracking_number: trackingNumber,
    carrier: carrier,
    status: events[events.length - 1].status as any,
    estimated_delivery: deliveryDate.toISOString(),
    tracking_events: events
  });
}
