
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { generateRandomCode } from '@/utils/codeGenerator';

// Type for postal verification codes
export type PostalVerificationCode = {
  id: string;
  user_id: string;
  physical_address_id: string;
  verification_code: string;
  created_at: string;
  expires_at: string;
  verified_at: string | null;
  attempts: number;
  max_attempts: number;
  status: 'pending' | 'verified' | 'expired' | 'cancelled';
  mail_status: 'preparing' | 'sent' | 'delivered' | 'failed';
  tracking_number: string | null;
};

/**
 * Generate and store a new postal verification code for an address
 */
export const generateVerificationCode = async (
  userId: string,
  physicalAddressId: string
): Promise<PostalVerificationCode | null> => {
  try {
    // Check if there's already an active verification code
    const { data: existingCodes, error: checkError } = await supabase
      .from('postal_verification_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('physical_address_id', physicalAddressId)
      .eq('status', 'pending')
      .maybeSingle();

    if (checkError) {
      console.error('Error checking for existing verification code:', checkError);
      throw checkError;
    }

    // If there's an active code, return it
    if (existingCodes) {
      return existingCodes as PostalVerificationCode;
    }

    // Generate a new verification code (6-digit alphanumeric)
    const code = generateRandomCode(6);

    // Insert the new code into the database
    const { data, error } = await supabase
      .from('postal_verification_codes')
      .insert([
        {
          user_id: userId,
          physical_address_id: physicalAddressId,
          verification_code: code,
          status: 'pending',
          mail_status: 'preparing'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error generating verification code:', error);
      throw error;
    }

    // Request mail service to send the code (this would call an edge function in production)
    await requestPostcardDelivery(data.id);

    return data as PostalVerificationCode;
  } catch (error) {
    console.error('Error in generateVerificationCode:', error);
    toast.error('Failed to generate verification code', {
      description: error instanceof Error ? error.message : 'Unknown error'
    });
    return null;
  }
};

/**
 * Verify a postal verification code
 */
export const verifyPostalCode = async (
  userId: string,
  physicalAddressId: string,
  code: string
): Promise<{
  success: boolean;
  message: string;
  verificationCode?: PostalVerificationCode;
}> => {
  try {
    // Get the verification code record
    const { data, error } = await supabase
      .from('postal_verification_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('physical_address_id', physicalAddressId)
      .eq('verification_code', code)
      .maybeSingle();

    if (error) {
      console.error('Error fetching verification code:', error);
      throw error;
    }

    if (!data) {
      return {
        success: false,
        message: 'Invalid verification code. Please check and try again.'
      };
    }

    const verificationCode = data as PostalVerificationCode;

    // Check if the code is already verified
    if (verificationCode.status === 'verified') {
      return {
        success: true,
        message: 'Address already verified.',
        verificationCode
      };
    }

    // Check if the code is expired
    if (verificationCode.status === 'expired' || new Date(verificationCode.expires_at) < new Date()) {
      // Update the status to expired if it wasn't already
      if (verificationCode.status !== 'expired') {
        await supabase
          .from('postal_verification_codes')
          .update({ status: 'expired' })
          .eq('id', verificationCode.id);
      }
      
      return {
        success: false,
        message: 'Verification code has expired. Please request a new one.',
        verificationCode: {
          ...verificationCode,
          status: 'expired'
        }
      };
    }

    // Check if max attempts reached
    if (verificationCode.attempts >= verificationCode.max_attempts) {
      await supabase
        .from('postal_verification_codes')
        .update({ status: 'cancelled' })
        .eq('id', verificationCode.id);
        
      return {
        success: false,
        message: 'Maximum verification attempts reached. Please request a new code.',
        verificationCode: {
          ...verificationCode,
          status: 'cancelled'
        }
      };
    }

    // Increment the attempt counter
    const { data: updatedCode, error: updateError } = await supabase
      .from('postal_verification_codes')
      .update({ 
        attempts: verificationCode.attempts + 1,
        verified_at: code === verificationCode.verification_code ? new Date().toISOString() : null,
        status: code === verificationCode.verification_code ? 'verified' : 'pending'
      })
      .eq('id', verificationCode.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating verification code:', updateError);
      throw updateError;
    }

    // If the code matches, mark the address as verified
    if (code === verificationCode.verification_code) {
      await supabase
        .from('physical_addresses')
        .update({
          postal_verified: true,
          postal_verification_date: new Date().toISOString(),
          verification_status: 'verified',
          verification_method: 'postal_code',
          verification_date: new Date().toISOString()
        })
        .eq('id', physicalAddressId);

      return {
        success: true,
        message: 'Address verified successfully!',
        verificationCode: updatedCode as PostalVerificationCode
      };
    }

    return {
      success: false,
      message: `Invalid code. Attempts remaining: ${verificationCode.max_attempts - (verificationCode.attempts + 1)}`,
      verificationCode: updatedCode as PostalVerificationCode
    };
  } catch (error) {
    console.error('Error in verifyPostalCode:', error);
    toast.error('Failed to verify code', {
      description: error instanceof Error ? error.message : 'Unknown error'
    });
    return {
      success: false,
      message: 'An error occurred during verification. Please try again.'
    };
  }
};

/**
 * Get the current verification code status for an address
 */
export const getVerificationStatus = async (
  userId: string,
  physicalAddressId: string
): Promise<PostalVerificationCode | null> => {
  try {
    const { data, error } = await supabase
      .from('postal_verification_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('physical_address_id', physicalAddressId)
      .order('created_at', { ascending: false })
      .maybeSingle();

    if (error) {
      console.error('Error fetching verification status:', error);
      throw error;
    }

    return data as PostalVerificationCode | null;
  } catch (error) {
    console.error('Error in getVerificationStatus:', error);
    return null;
  }
};

/**
 * Cancel an existing verification code
 */
export const cancelVerificationCode = async (
  userId: string,
  codeId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('postal_verification_codes')
      .update({ status: 'cancelled' })
      .eq('id', codeId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error cancelling verification code:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in cancelVerificationCode:', error);
    toast.error('Failed to cancel verification code', {
      description: error instanceof Error ? error.message : 'Unknown error'
    });
    return false;
  }
};

/**
 * Request a postcard delivery with verification code
 * In a production environment, this would call an external mail service API
 */
export const requestPostcardDelivery = async (codeId: string): Promise<boolean> => {
  try {
    // Get the verification code record with related address
    const { data, error } = await supabase
      .from('postal_verification_codes')
      .select(`
        *,
        physical_address:physical_address_id(
          street_address,
          city,
          state,
          postal_code,
          country
        )
      `)
      .eq('id', codeId)
      .single();

    if (error) {
      console.error('Error fetching verification code for delivery:', error);
      throw error;
    }

    // Simulate mail service API call
    console.log('Simulating mail service API call to send verification code');
    console.log('Sending code to address:', data.physical_address);
    
    // In production, this would call an edge function to handle the mail service API
    // Update the mail_status to 'sent' and add a tracking number
    const trackingNumber = 'SIM' + Math.random().toString(36).substring(2, 10).toUpperCase();
    
    const { error: updateError } = await supabase
      .from('postal_verification_codes')
      .update({ 
        mail_status: 'sent',
        tracking_number: trackingNumber
      })
      .eq('id', codeId);

    if (updateError) {
      console.error('Error updating mail status:', updateError);
      throw updateError;
    }

    toast.success('Verification code has been sent', {
      description: 'You will receive a postcard with your verification code shortly.'
    });

    return true;
  } catch (error) {
    console.error('Error in requestPostcardDelivery:', error);
    toast.error('Failed to send verification code', {
      description: error instanceof Error ? error.message : 'Unknown error'
    });
    return false;
  }
};
