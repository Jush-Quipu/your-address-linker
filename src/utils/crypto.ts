
/**
 * Cryptographic utilities for secure data handling
 */

// Generate a random symmetric encryption key
export const generateSymmetricKey = (): Uint8Array => {
  return crypto.getRandomValues(new Uint8Array(32)); // 256-bit key
};

// Convert string to ArrayBuffer
const str2ab = (str: string): ArrayBuffer => {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0; i < str.length; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
};

// Convert ArrayBuffer to string
const ab2str = (buf: ArrayBuffer): string => {
  return String.fromCharCode.apply(null, Array.from(new Uint8Array(buf)));
};

// Export a key as base64 string
export const exportKeyAsBase64 = (key: Uint8Array): string => {
  return btoa(String.fromCharCode.apply(null, Array.from(key)));
};

// Import a key from base64 string
export const importKeyFromBase64 = (keyStr: string): Uint8Array => {
  const binary = atob(keyStr);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

// Generate a random nonce
export const generateNonce = (): Uint8Array => {
  return crypto.getRandomValues(new Uint8Array(12)); // 96-bit nonce
};

// Encrypt data using symmetric encryption (AES-GCM)
export const encryptData = async (
  data: string, 
  key: Uint8Array
): Promise<{ encryptedData: string; nonce: string }> => {
  try {
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );
    
    const nonce = generateNonce();
    const encodedData = new TextEncoder().encode(data);
    
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: nonce
      },
      cryptoKey,
      encodedData
    );
    
    const encryptedData = btoa(ab2str(encryptedBuffer));
    const nonceBase64 = btoa(String.fromCharCode.apply(null, Array.from(nonce)));
    
    return {
      encryptedData,
      nonce: nonceBase64
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

// Decrypt data using symmetric encryption (AES-GCM)
export const decryptData = async (
  encryptedData: string, 
  key: Uint8Array, 
  nonceStr: string
): Promise<string> => {
  try {
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    const encryptedBuffer = str2ab(atob(encryptedData));
    const nonce = Uint8Array.from(atob(nonceStr), c => c.charCodeAt(0));
    
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: nonce
      },
      cryptoKey,
      encryptedBuffer
    );
    
    return new TextDecoder().decode(decryptedBuffer);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

// Generate RSA key pair for asymmetric encryption
export const generateRSAKeyPair = async (): Promise<CryptoKeyPair> => {
  return await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  );
};

// Export RSA public key
export const exportRSAPublicKey = async (publicKey: CryptoKey): Promise<string> => {
  const exported = await crypto.subtle.exportKey('spki', publicKey);
  return btoa(ab2str(exported));
};

// Export RSA private key (should be stored securely!)
export const exportRSAPrivateKey = async (privateKey: CryptoKey): Promise<string> => {
  const exported = await crypto.subtle.exportKey('pkcs8', privateKey);
  return btoa(ab2str(exported));
};

// Import RSA public key
export const importRSAPublicKey = async (publicKeyStr: string): Promise<CryptoKey> => {
  const binaryDer = str2ab(atob(publicKeyStr));
  
  return await crypto.subtle.importKey(
    'spki',
    binaryDer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['encrypt']
  );
};

// Import RSA private key
export const importRSAPrivateKey = async (privateKeyStr: string): Promise<CryptoKey> => {
  const binaryDer = str2ab(atob(privateKeyStr));
  
  return await crypto.subtle.importKey(
    'pkcs8',
    binaryDer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['decrypt']
  );
};

// Calculate cryptographic hash
export const calculateHash = async (data: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  
  // Convert hash to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Generate a random token
export const generateToken = (length: number = 32): string => {
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, byte => byte.toString(16).padStart(2, '0')).join('');
};
