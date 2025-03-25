
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export enum VerificationStatus {
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

export enum DocumentType {
  UTILITY_BILL = 'utility_bill',
  BANK_STATEMENT = 'bank_statement',
  GOVERNMENT_ID = 'government_id',
  TAX_DOCUMENT = 'tax_document'
}

export interface VerificationDocument {
  user_id: string;
  address_id: string;
  document_type: DocumentType;
  document_data: string; // Base64 encoded document
  metadata?: Record<string, any>;
}

export interface VerificationResponse {
  verification_id: string;
  status: VerificationStatus;
  message: string;
  estimated_time?: string;
}

export interface VerificationLog {
  id: string;
  verification_type: string;
  document_type?: string;
  status: string;
  verification_date: string;
  metadata?: Record<string, any>;
}

// Submit a document for address verification
export const submitVerificationDocument = async (document: VerificationDocument): Promise<VerificationResponse> => {
  try {
    const { data: token } = await supabase.auth.getSession();
    if (!token.session) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${supabase.supabaseUrl}/functions/v1/verify-address-document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.session.access_token}`
      },
      body: JSON.stringify(document)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit verification document');
    }

    const result = await response.json();
    
    toast.success('Document submitted successfully', {
      description: 'Your document has been submitted for verification.'
    });
    
    return result.data;
  } catch (error) {
    console.error('Error submitting verification document:', error);
    toast.error('Failed to submit document', {
      description: error instanceof Error ? error.message : 'Unknown error occurred'
    });
    throw error;
  }
};

// Get verification status for an address
export const getAddressVerificationStatus = async (addressId: string): Promise<VerificationStatus> => {
  try {
    const { data: token } = await supabase.auth.getSession();
    if (!token.session) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${supabase.supabaseUrl}/functions/v1/get-verification-status?address_id=${addressId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.session.access_token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get verification status');
    }

    const result = await response.json();
    return result.data.status;
  } catch (error) {
    console.error('Error getting verification status:', error);
    throw error;
  }
};

// Get verification logs for an address
export const getVerificationLogs = async (addressId: string): Promise<VerificationLog[]> => {
  try {
    const { data, error } = await supabase
      .from('address_verification_logs')
      .select('*')
      .eq('physical_address_id', addressId)
      .order('verification_date', { ascending: false });
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching verification logs:', error);
    throw error;
  }
};

// File to base64 utility function
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove the prefix (e.g. "data:image/jpeg;base64,")
      const base64 = reader.result as string;
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = error => reject(error);
  });
};
