
/**
 * SecureAddress Bridge Sandbox Controller
 * 
 * This controller provides mock API responses for testing the SDK
 * without making actual API calls or requiring real address verification.
 */

export interface SandboxConfig {
  // Controls response delay to simulate network latency (in ms)
  responseDelay: number;
  // Controls if errors should be simulated
  simulateErrors: boolean;
  // Error rate (0-1) if simulation is enabled
  errorRate: number;
  // Controls if address verification should be simulated as successful
  verificationSuccess: boolean;
  // Controls if wallet connection should be simulated as successful
  walletConnectionSuccess: boolean;
  // Controls the default mock address to return
  mockAddress: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    verified: boolean;
    verification_method: string;
    verification_date: string;
  };
  // Controls mock shipping options
  mockShipping: {
    carriers: string[];
    available: boolean;
    trackingAvailable: boolean;
  };
}

// Default sandbox configuration
const defaultConfig: SandboxConfig = {
  responseDelay: 300,
  simulateErrors: false,
  errorRate: 0.1,
  verificationSuccess: true,
  walletConnectionSuccess: true,
  mockAddress: {
    street: "123 Privacy Lane",
    city: "Secureville",
    state: "California",
    postal_code: "94321",
    country: "United States",
    verified: true,
    verification_method: "document_upload",
    verification_date: new Date().toISOString(),
  },
  mockShipping: {
    carriers: ["usps", "fedex", "ups"],
    available: true,
    trackingAvailable: true,
  }
};

let sandboxConfig: SandboxConfig = { ...defaultConfig };

/**
 * Get the current sandbox configuration
 */
export function getSandboxConfig(): SandboxConfig {
  return { ...sandboxConfig };
}

/**
 * Update the sandbox configuration
 */
export function updateSandboxConfig(config: Partial<SandboxConfig>): SandboxConfig {
  sandboxConfig = {
    ...sandboxConfig,
    ...config,
    // Merge nested objects
    mockAddress: {
      ...sandboxConfig.mockAddress,
      ...(config.mockAddress || {})
    },
    mockShipping: {
      ...sandboxConfig.mockShipping,
      ...(config.mockShipping || {})
    }
  };
  return { ...sandboxConfig };
}

/**
 * Reset sandbox configuration to defaults
 */
export function resetSandboxConfig(): SandboxConfig {
  sandboxConfig = { ...defaultConfig };
  return { ...sandboxConfig };
}

/**
 * Should this request simulate an error based on config
 */
function shouldSimulateError(): boolean {
  if (!sandboxConfig.simulateErrors) return false;
  return Math.random() < sandboxConfig.errorRate;
}

/**
 * Create a delayed response to simulate network latency
 */
async function delayedResponse<T>(response: T): Promise<T> {
  if (sandboxConfig.responseDelay > 0) {
    await new Promise(resolve => setTimeout(resolve, sandboxConfig.responseDelay));
  }
  return response;
}

/**
 * Mock authorization request response
 */
export async function handleAuthorize(options: any): Promise<any> {
  if (shouldSimulateError()) {
    return delayedResponse({
      success: false,
      error: "sandbox_error",
      errorDescription: "Simulated error in the sandbox environment"
    });
  }

  // In real app this would redirect to authorization page
  // For sandbox, we return a mockup of redirect URL
  const mockRedirectUrl = `https://api.secureaddress.bridge/authorize?` +
    `app_id=${options.appId || "app_sandbox"}` +
    `&redirect_uri=${encodeURIComponent(options.redirectUri || "https://example.com/callback")}` +
    `&scope=${encodeURIComponent(Array.isArray(options.scope) ? options.scope.join(' ') : (options.scope || "address.basic"))}` +
    `&state=${options.state || "sandbox_state"}`;

  return delayedResponse({
    success: true,
    redirectUrl: mockRedirectUrl
  });
}

/**
 * Mock callback handling response
 */
export async function handleCallback(token?: string): Promise<any> {
  if (shouldSimulateError()) {
    return delayedResponse({
      success: false,
      error: "invalid_request",
      errorDescription: "Simulated error in callback handling"
    });
  }

  // Generate a mock token if none provided
  const accessToken = token || `sandbox_token_${Date.now()}`;

  return delayedResponse({
    success: true,
    accessToken
  });
}

/**
 * Mock address retrieval
 */
export async function getAddress(options: any = {}): Promise<any> {
  if (shouldSimulateError()) {
    return delayedResponse({
      success: false,
      error: "unauthorized",
      errorDescription: "Simulated error in address retrieval"
    });
  }

  if (!sandboxConfig.verificationSuccess) {
    return delayedResponse({
      success: false,
      error: "verification_failed",
      errorDescription: "Address verification has not been completed"
    });
  }

  // Return the mock address from config
  return delayedResponse({
    success: true,
    address: { ...sandboxConfig.mockAddress },
    permission: {
      id: "perm_sandbox",
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      max_accesses: 10,
      remaining_accesses: 9,
      scope: options.fields || ["street", "city", "state", "postal_code", "country"]
    }
  });
}

/**
 * Mock token validation
 */
export async function validateToken(): Promise<any> {
  if (shouldSimulateError()) {
    return delayedResponse({
      valid: false,
      error: "token_invalid",
      status: 401
    });
  }

  return delayedResponse({
    valid: true,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    scope: ["street", "city", "state", "postal_code", "country"],
    user_id: "usr_sandbox",
    app_id: "app_sandbox"
  });
}

/**
 * Mock wallet connection
 */
export async function connectWallet(options: any = {}): Promise<any> {
  if (shouldSimulateError() || !sandboxConfig.walletConnectionSuccess) {
    return delayedResponse({
      success: false,
      error: "wallet_connection_failed",
      errorDescription: "Simulated wallet connection failure"
    });
  }

  return delayedResponse({
    success: true,
    address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    chainId: "0x1",
    providerType: options.providerType || "injected"
  });
}

/**
 * Mock address to wallet linking
 */
export async function linkAddressToWallet(options: any): Promise<any> {
  if (shouldSimulateError()) {
    return delayedResponse({
      success: false,
      error: "linking_failed",
      errorDescription: "Simulated error in wallet linking"
    });
  }

  if (!sandboxConfig.verificationSuccess) {
    return delayedResponse({
      success: false,
      error: "verification_required",
      errorDescription: "Address must be verified before linking to wallet"
    });
  }

  return delayedResponse({
    success: true,
    wallet_address: options.walletAddress || "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    chain_id: options.chainId || "0x1",
    linked_at: new Date().toISOString(),
    verifiable_credential: options.createVerifiableCredential ? {
      id: "vc_sandbox",
      type: ["VerifiableCredential", "AddressCredential"],
      issuer: "did:web:secureaddress.bridge",
      issuanceDate: new Date().toISOString(),
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    } : null
  });
}

/**
 * Mock shipping token creation
 */
export async function createBlindShippingToken(options: any = {}): Promise<any> {
  if (shouldSimulateError() || !sandboxConfig.mockShipping.available) {
    return delayedResponse({
      success: false,
      error: "shipping_unavailable",
      errorDescription: "Simulated shipping unavailability"
    });
  }

  // Validate carriers from the request against the available ones
  const requestedCarriers = options.carriers || [];
  const availableCarriers = sandboxConfig.mockShipping.carriers;
  const invalidCarriers = requestedCarriers.filter(c => !availableCarriers.includes(c));
  
  if (invalidCarriers.length > 0) {
    return delayedResponse({
      success: false,
      error: "invalid_carriers",
      errorDescription: `Carriers not supported: ${invalidCarriers.join(', ')}`
    });
  }

  return delayedResponse({
    success: true,
    shipping_token: `ship_sandbox_${Date.now()}`,
    expires_at: new Date(Date.now() + (options.expiryDays || 7) * 24 * 60 * 60 * 1000).toISOString(),
    max_uses: options.maxUses || 1,
    remaining_uses: options.maxUses || 1,
    carriers: options.carriers || availableCarriers,
    shipping_methods: options.shippingMethods || ["Priority", "Ground", "Express"]
  });
}

/**
 * Mock shipment request
 */
export async function requestShipment(options: any = {}): Promise<any> {
  if (shouldSimulateError() || !sandboxConfig.mockShipping.available) {
    return delayedResponse({
      success: false,
      error: "shipment_failed",
      errorDescription: "Simulated shipment failure"
    });
  }

  return delayedResponse({
    success: true,
    tracking_number: `TRACK${Math.floor(Math.random() * 10000000)}`,
    carrier: options.carrier || "usps",
    service: options.service || "Priority",
    label_url: "https://sandbox-secureaddress.bridge/labels/sample-label.pdf",
    estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    cost: {
      amount: Math.random() * 20 + 5,
      currency: "USD"
    }
  });
}

/**
 * Mock tracking info
 */
export async function getTrackingInfo(trackingNumber: string, carrier: string): Promise<any> {
  if (shouldSimulateError() || !sandboxConfig.mockShipping.trackingAvailable) {
    return delayedResponse({
      success: false,
      error: "tracking_unavailable",
      errorDescription: "Simulated tracking unavailability"
    });
  }

  // Generate random status based on time
  const statuses = ["pre_transit", "in_transit", "out_for_delivery", "delivered", "exception"];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

  return delayedResponse({
    success: true,
    tracking_number: trackingNumber,
    carrier: carrier,
    status: randomStatus,
    estimated_delivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    last_update: new Date().toISOString(),
    tracking_events: [
      {
        status: "pre_transit",
        location: "Shipping Label Created",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        status: "in_transit",
        location: "Origin Facility",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      randomStatus === "delivered" ? {
        status: "delivered",
        location: "Destination",
        timestamp: new Date().toISOString()
      } : null
    ].filter(Boolean)
  });
}

/**
 * Mock webhook registration
 */
export async function registerWebhook(options: any): Promise<any> {
  if (shouldSimulateError()) {
    return delayedResponse({
      success: false,
      error: "webhook_registration_failed",
      errorDescription: "Simulated webhook registration failure"
    });
  }

  return delayedResponse({
    success: true,
    webhook_id: `hook_sandbox_${Date.now()}`,
    url: options.url,
    events: options.events,
    created_at: new Date().toISOString()
  });
}
