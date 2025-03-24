
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

export type EncryptionKey = Tables<'encryption_keys'>;

// A simplified implementation of encryption using Web Crypto API
// In a production environment, consider using a more robust library

/**
 * Generates a new RSA key pair for encryption
 */
export const generateKeyPair = async (): Promise<CryptoKeyPair> => {
  try {
    // Generate RSA key pair
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true, // extractable
      ['encrypt', 'decrypt']
    );
    
    return keyPair;
  } catch (error) {
    console.error('Error generating key pair:', error);
    throw error;
  }
};

/**
 * Exports a public key to base64 string format
 */
export const exportPublicKey = async (publicKey: CryptoKey): Promise<string> => {
  try {
    const exported = await window.crypto.subtle.exportKey('spki', publicKey);
    return arrayBufferToBase64(exported);
  } catch (error) {
    console.error('Error exporting public key:', error);
    throw error;
  }
};

/**
 * Exports a private key to base64 string format (should be stored securely, e.g. in device-only storage)
 */
export const exportPrivateKey = async (privateKey: CryptoKey): Promise<string> => {
  try {
    const exported = await window.crypto.subtle.exportKey('pkcs8', privateKey);
    return arrayBufferToBase64(exported);
  } catch (error) {
    console.error('Error exporting private key:', error);
    throw error;
  }
};

/**
 * Imports a public key from base64 string format
 */
export const importPublicKey = async (publicKeyString: string): Promise<CryptoKey> => {
  try {
    const binaryDer = base64ToArrayBuffer(publicKeyString);
    
    return await window.crypto.subtle.importKey(
      'spki',
      binaryDer,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      true,
      ['encrypt']
    );
  } catch (error) {
    console.error('Error importing public key:', error);
    throw error;
  }
};

/**
 * Imports a private key from base64 string format
 */
export const importPrivateKey = async (privateKeyString: string): Promise<CryptoKey> => {
  try {
    const binaryDer = base64ToArrayBuffer(privateKeyString);
    
    return await window.crypto.subtle.importKey(
      'pkcs8',
      binaryDer,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      true,
      ['decrypt']
    );
  } catch (error) {
    console.error('Error importing private key:', error);
    throw error;
  }
};

/**
 * Encrypts text data using a public key
 */
export const encryptData = async (publicKey: CryptoKey, data: string): Promise<{ encryptedData: string, nonce: string }> => {
  try {
    // Generate a random nonce
    const nonce = window.crypto.getRandomValues(new Uint8Array(16));
    
    // Encrypt the data
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP',
      },
      publicKey,
      dataBuffer
    );
    
    return {
      encryptedData: arrayBufferToBase64(encryptedBuffer),
      nonce: arrayBufferToBase64(nonce),
    };
  } catch (error) {
    console.error('Error encrypting data:', error);
    throw error;
  }
};

/**
 * Decrypts encrypted data using a private key
 */
export const decryptData = async (privateKey: CryptoKey, encryptedData: string): Promise<string> => {
  try {
    const encryptedBuffer = base64ToArrayBuffer(encryptedData);
    
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'RSA-OAEP',
      },
      privateKey,
      encryptedBuffer
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error('Error decrypting data:', error);
    throw error;
  }
};

/**
 * Creates and stores a new encryption key in the database
 */
export const createAndStoreEncryptionKey = async (userId: string): Promise<EncryptionKey> => {
  try {
    // Generate a new key pair
    const keyPair = await generateKeyPair();
    
    // Export the public key
    const publicKeyString = await exportPublicKey(keyPair.publicKey);
    
    // Save the private key locally (in a real app, this would be stored securely)
    // For this demo, we'll save it to localStorage
    const privateKeyString = await exportPrivateKey(keyPair.privateKey);
    localStorage.setItem(`private_key_${userId}`, privateKeyString);
    
    // Store the public key in the database
    const { data, error } = await supabase
      .from('encryption_keys')
      .insert([{
        user_id: userId,
        public_key: publicKeyString,
        key_type: 'rsa',
        active: true
      }])
      .select()
      .single();
      
    if (error) {
      console.error('Error storing encryption key:', error);
      throw error;
    }
    
    toast.success('New encryption key created', {
      description: 'Your addresses will now be encrypted for enhanced privacy'
    });
    
    return data;
  } catch (error) {
    console.error('Error creating and storing encryption key:', error);
    toast.error('Failed to create encryption key', {
      description: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

/**
 * Gets the active encryption key for a user
 */
export const getActiveEncryptionKey = async (userId: string): Promise<EncryptionKey | null> => {
  try {
    const { data, error } = await supabase
      .from('encryption_keys')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching encryption key:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting active encryption key:', error);
    return null;
  }
};

/**
 * Gets the private key from local storage
 */
export const getPrivateKeyFromStorage = (userId: string): string | null => {
  return localStorage.getItem(`private_key_${userId}`);
};

/**
 * Encrypts an address object
 */
export const encryptAddress = async (
  publicKey: CryptoKey, 
  address: { 
    street_address: string; 
    city: string; 
    state: string; 
    postal_code: string; 
    country: string; 
  }
): Promise<{
  encrypted_street_address: string;
  encrypted_city: string;
  encrypted_state: string;
  encrypted_postal_code: string;
  encrypted_country: string;
  encryption_nonce: string;
}> => {
  // Generate a single nonce for all fields
  const nonce = window.crypto.getRandomValues(new Uint8Array(16));
  const nonceString = arrayBufferToBase64(nonce);
  
  // Encrypt each field
  const [
    encryptedStreet,
    encryptedCity,
    encryptedState,
    encryptedPostalCode,
    encryptedCountry
  ] = await Promise.all([
    encryptData(publicKey, address.street_address),
    encryptData(publicKey, address.city),
    encryptData(publicKey, address.state),
    encryptData(publicKey, address.postal_code),
    encryptData(publicKey, address.country)
  ]);
  
  return {
    encrypted_street_address: encryptedStreet.encryptedData,
    encrypted_city: encryptedCity.encryptedData,
    encrypted_state: encryptedState.encryptedData,
    encrypted_postal_code: encryptedPostalCode.encryptedData,
    encrypted_country: encryptedCountry.encryptedData,
    encryption_nonce: nonceString
  };
};

/**
 * Decrypts an encrypted address
 */
export const decryptAddress = async (
  privateKey: CryptoKey,
  encryptedAddress: {
    encrypted_street_address: string;
    encrypted_city: string;
    encrypted_state: string;
    encrypted_postal_code: string;
    encrypted_country: string;
  }
): Promise<{
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}> => {
  // Decrypt each field
  const [
    decryptedStreet,
    decryptedCity,
    decryptedState,
    decryptedPostalCode,
    decryptedCountry
  ] = await Promise.all([
    decryptData(privateKey, encryptedAddress.encrypted_street_address),
    decryptData(privateKey, encryptedAddress.encrypted_city),
    decryptData(privateKey, encryptedAddress.encrypted_state),
    decryptData(privateKey, encryptedAddress.encrypted_postal_code),
    decryptData(privateKey, encryptedAddress.encrypted_country)
  ]);
  
  return {
    street_address: decryptedStreet,
    city: decryptedCity,
    state: decryptedState,
    postal_code: decryptedPostalCode,
    country: decryptedCountry
  };
};

// Helper functions for converting between ArrayBuffer and base64 string
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
