
import { supabase } from '@/integrations/supabase/client';
import { getCarrierService } from './carriers';
import { ShipmentRequest, ShipmentResponse, ShipmentAddress } from './carriers/carrier.interface';
import { generateMockCredentials } from './carrierCredentialsService';
import { toast } from 'sonner';

export interface Shipment {
  id: string;
  user_id: string;
  permission_id: string;
  carrier: string;
  service: string;
  tracking_number: string | null;
  status: string;
  package_details: any;
  carrier_details: any;
  tracking_details: any;
  created_at: string;
  updated_at: string;
  confirmation_required: boolean | null;
  confirmation_status: string | null;
}

/**
 * Get all shipments for the current user
 */
export async function getUserShipments(): Promise<Shipment[]> {
  try {
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching shipments:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getUserShipments:', error);
    throw error;
  }
}

/**
 * Get shipments by permission ID
 */
export async function getShipmentsByPermissionId(permissionId: string): Promise<Shipment[]> {
  try {
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('permission_id', permissionId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching shipments by permission ID:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getShipmentsByPermissionId:', error);
    throw error;
  }
}

/**
 * Get a single shipment by ID
 */
export async function getShipmentById(shipmentId: string): Promise<Shipment | null> {
  try {
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('id', shipmentId)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching shipment:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getShipmentById:', error);
    throw error;
  }
}

/**
 * Update shipment status
 */
export async function updateShipmentStatus(
  shipmentId: string, 
  status: string, 
  trackingDetails?: any
): Promise<void> {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };
    
    if (trackingDetails) {
      updateData.tracking_details = trackingDetails;
    }
    
    const { error } = await supabase
      .from('shipments')
      .update(updateData)
      .eq('id', shipmentId);
      
    if (error) {
      console.error('Error updating shipment status:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateShipmentStatus:', error);
    throw error;
  }
}

/**
 * Track a shipment with the carrier
 */
export async function trackShipment(shipmentId: string): Promise<any> {
  try {
    // Get the shipment
    const shipment = await getShipmentById(shipmentId);
    if (!shipment || !shipment.tracking_number) {
      throw new Error('Shipment not found or tracking number missing');
    }
    
    // Get the carrier service
    const carrierService = getCarrierService(shipment.carrier);
    if (!carrierService) {
      throw new Error(`Carrier ${shipment.carrier} not supported`);
    }
    
    // In a production app, we'd retrieve the actual credentials
    // For now, we'll use the mock credentials 
    const mockCredentials = generateMockCredentials(shipment.carrier);
    
    // Track with the carrier
    const trackingInfo = await carrierService.trackShipment(
      shipment.tracking_number,
      mockCredentials
    );
    
    // Update the shipment with tracking info
    await updateShipmentStatus(
      shipmentId,
      trackingInfo.status,
      trackingInfo
    );
    
    return trackingInfo;
  } catch (error) {
    console.error('Error tracking shipment:', error);
    throw error;
  }
}

/**
 * Create a shipment with a carrier
 */
export async function createShipment(
  permissionId: string,
  recipientAddress: ShipmentAddress,
  carrierId: string,
  shipmentDetails: ShipmentRequest
): Promise<ShipmentResponse> {
  try {
    // Get the carrier service
    const carrierService = getCarrierService(carrierId);
    if (!carrierService) {
      throw new Error(`Carrier ${carrierId} not supported`);
    }
    
    // In a production app, we'd retrieve the actual credentials
    // For now, we'll use the mock credentials
    const mockCredentials = generateMockCredentials(carrierId);
    
    // Create shipment with the carrier
    const response = await carrierService.createShipment(
      recipientAddress,
      shipmentDetails,
      mockCredentials
    );
    
    if (response.success) {
      // Insert the shipment record
      const { data, error } = await supabase
        .from('shipments')
        .insert({
          permission_id: permissionId,
          carrier: carrierId,
          service: shipmentDetails.service,
          tracking_number: response.trackingNumber,
          status: 'created',
          package_details: shipmentDetails,
          carrier_details: response
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating shipment record:', error);
        response.error = 'Failed to create shipment record: ' + error.message;
        response.success = false;
      }
    }
    
    return response;
  } catch (error) {
    console.error('Error creating shipment:', error);
    return {
      success: false,
      carrier: carrierId,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Confirm delivery of a shipment
 */
export async function confirmDelivery(shipmentId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('shipments')
      .update({
        confirmation_status: 'confirmed',
        updated_at: new Date().toISOString()
      })
      .eq('id', shipmentId);
      
    if (error) {
      console.error('Error confirming delivery:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in confirmDelivery:', error);
    throw error;
  }
}

/**
 * Cancel a shipment
 */
export async function cancelShipment(shipmentId: string): Promise<boolean> {
  try {
    const shipment = await getShipmentById(shipmentId);
    if (!shipment) {
      throw new Error('Shipment not found');
    }

    // Only allow cancellation for shipments that are not yet in transit
    if (['in_transit', 'out_for_delivery', 'delivered', 'exception'].includes(shipment.status)) {
      toast.error('Cannot cancel a shipment that is already in transit or delivered');
      return false;
    }

    // In a real implementation, we would call the carrier's API to cancel the shipment
    // For now, we'll just update the status
    const { error } = await supabase
      .from('shipments')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', shipmentId);

    if (error) {
      console.error('Error cancelling shipment:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in cancelShipment:', error);
    throw error;
  }
}

/**
 * Get available carrier services for creating a shipment
 */
export function getAvailableCarriers() {
  return [
    { id: 'usps', name: 'USPS' },
    { id: 'fedex', name: 'FedEx' },
    { id: 'ups', name: 'UPS' },
    { id: 'dhl', name: 'DHL' }
  ];
}
