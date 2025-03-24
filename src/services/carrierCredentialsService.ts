
import { supabase } from '@/integrations/supabase/client';
import { CarrierAuth, CarrierCredentials } from './carriers';

interface CarrierCredentialsRecord {
  id: string;
  carrier_id: string;
  credentials: CarrierCredentials;
  use_test_mode: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Service for managing carrier API credentials
 */
export async function getCarrierCredentials(carrierId: string, useTestMode: boolean = false): Promise<CarrierAuth | null> {
  try {
    const { data, error } = await supabase
      .from('carrier_credentials')
      .select('*')
      .eq('carrier_id', carrierId)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching carrier credentials:', error);
      return null;
    }
    
    if (!data) {
      console.warn(`No credentials found for carrier: ${carrierId}`);
      return null;
    }
    
    const record = data as CarrierCredentialsRecord;
    
    // Return test or production credentials based on the useTestMode flag
    const credentials = record.credentials;
    return useTestMode ? credentials.test : credentials.production;
  } catch (error) {
    console.error('Error in getCarrierCredentials:', error);
    return null;
  }
}

/**
 * Save carrier credentials to the database
 */
export async function saveCarrierCredentials(
  carrierId: string, 
  credentials: CarrierCredentials
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('carrier_credentials')
      .upsert(
        { 
          carrier_id: carrierId,
          credentials,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'carrier_id' }
      );
      
    if (error) {
      console.error('Error saving carrier credentials:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in saveCarrierCredentials:', error);
    return false;
  }
}

/**
 * Toggle test mode for a carrier
 */
export async function toggleCarrierTestMode(carrierId: string, useTestMode: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('carrier_credentials')
      .update({ 
        use_test_mode: useTestMode,
        updated_at: new Date().toISOString()
      })
      .eq('carrier_id', carrierId);
      
    if (error) {
      console.error('Error toggling carrier test mode:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in toggleCarrierTestMode:', error);
    return false;
  }
}

/**
 * For development/testing, this function generates mock credentials
 * In a real application, we would never do this!
 */
export function generateMockCredentials(carrierId: string): CarrierAuth {
  return {
    apiKey: `mock-api-key-for-${carrierId}-${Date.now()}`,
    accountNumber: `mock-account-${carrierId}`,
    username: `mock-user-${carrierId}`,
    password: `mock-pass-${carrierId}`
  };
}
