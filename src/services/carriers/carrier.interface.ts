
/**
 * Interface for shipping carrier integrations
 */

export interface ShipmentDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'in' | 'cm';
}

export interface ShipmentWeight {
  value: number;
  unit: 'oz' | 'lb' | 'g' | 'kg';
}

export interface ShipmentAddress {
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface ShipmentRequest {
  service: string;
  packageType: string;
  weight?: ShipmentWeight;
  dimensions?: ShipmentDimensions;
  reference?: string;
  description?: string;
}

export interface ShipmentResponse {
  success: boolean;
  trackingNumber?: string;
  labelUrl?: string;
  estimatedDelivery?: string;
  cost?: {
    amount: number;
    currency: string;
  };
  carrier: string;
  error?: string;
}

export interface CarrierAuth {
  apiKey: string;
  accountNumber?: string;
  username?: string;
  password?: string;
}

export interface CarrierCredentials {
  production: CarrierAuth;
  test: CarrierAuth;
  useTestMode: boolean;
}

export interface CarrierConfig {
  id: string;
  name: string;
  baseUrl: string;
  services: string[];
  packageTypes: string[];
}

export interface CarrierService {
  id: string;
  name: string;
  getConfig(): CarrierConfig;
  validateCredentials(credentials: CarrierAuth): Promise<boolean>;
  createShipment(
    recipientAddress: ShipmentAddress,
    shipmentDetails: ShipmentRequest,
    credentials: CarrierAuth
  ): Promise<ShipmentResponse>;
  trackShipment(
    trackingNumber: string,
    credentials: CarrierAuth
  ): Promise<any>;
}
