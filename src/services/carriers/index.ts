
import { CarrierService } from './carrier.interface';
import { uspsService } from './usps';
import { fedexService } from './fedex';
import { upsService } from './ups';

// Map of all available carrier services
const carrierServices: Record<string, CarrierService> = {
  'usps': uspsService,
  'fedex': fedexService,
  'ups': upsService
};

/**
 * Get carrier service by id
 */
export function getCarrierService(carrierId: string): CarrierService | undefined {
  return carrierServices[carrierId];
}

/**
 * Get all carrier services
 */
export function getAllCarrierServices(): CarrierService[] {
  return Object.values(carrierServices);
}

export { uspsService, fedexService, upsService };
export type { 
  CarrierService, 
  CarrierConfig, 
  CarrierAuth,
  CarrierCredentials,
  ShipmentAddress,
  ShipmentDimensions, 
  ShipmentWeight,
  ShipmentRequest,
  ShipmentResponse
} from './carrier.interface';
