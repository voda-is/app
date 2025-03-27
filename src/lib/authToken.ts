import { box, randomBytes } from 'tweetnacl';

// Interface matching the Rust backend's AuthenticatedRequest
export interface AuthenticatedRequest {
  user_id: string;
  timestamp: number;
  origin: string;
}

// Get encryption key from environment variables
const getEncryptionKey = (): Uint8Array => {
  const keyString = process.env.AUTH_ENCRYPTION_KEY;
  if (!keyString) {
    throw new Error('Authentication encryption key not found in environment variables');
  }
  
  // Decode the base64 key to Uint8Array
  return base64ToUint8Array(keyString);
};

// Convert string to Uint8Array (UTF-8)
const stringToUint8Array = (str: string): Uint8Array => {
  return new TextEncoder().encode(str);
};

// Convert Uint8Array to string (UTF-8)
const uint8ArrayToString = (array: Uint8Array): string => {
  return new TextDecoder().decode(array);
};

// Convert Uint8Array to base64 string
const uint8ArrayToBase64 = (array: Uint8Array): string => {
  // Use browser's btoa function with binary string conversion
  const binaryString = Array.from(array)
    .map(byte => String.fromCharCode(byte))
    .join('');
  return btoa(binaryString);
};

// Convert base64 string to Uint8Array (handles URL-safe encoding with no padding)
const base64ToUint8Array = (base64: string): Uint8Array => {
  // Replace URL-safe characters with standard base64 characters
  let standardBase64 = base64.replace(/-/g, '+').replace(/_/g, '/');
  
  // Add padding if needed
  const padding = standardBase64.length % 4;
  if (padding) {
    standardBase64 += '='.repeat(4 - padding);
  }
  
  // Use browser's atob function with binary string conversion
  const binaryString = atob(standardBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// URL-safe base64 encoding (no padding)
const encodeURLSafe = (data: Uint8Array): string => {
  return uint8ArrayToBase64(data)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

// URL-safe base64 decoding
const decodeURLSafe = (str: string): Uint8Array => {
  // Add padding if needed
  const padding = str.length % 4;
  if (padding) {
    str += '='.repeat(4 - padding);
  }
  
  // Replace URL-safe characters
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  
  return base64ToUint8Array(str);
};

/**
 * Creates an authenticated token for API requests
 * @param userId The user's ID
 * @param origin The origin of the request (e.g., 'web', 'mobile')
 * @returns An encrypted authentication token
 */
export const createAuthToken = (userId: string, origin: string = 'voda.is'): string => {
  // Create the request object
  const request: AuthenticatedRequest = {
    user_id: userId,
    timestamp: Math.floor(Date.now() / 1000), // Current time in seconds
    origin
  };
  
  // Convert to JSON string and then to Uint8Array
  const messageUint8 = stringToUint8Array(JSON.stringify(request));
  
  // Generate a random nonce
  const nonce = randomBytes(box.nonceLength);
  
  // Get the encryption key
  const key = getEncryptionKey();
  
  // Encrypt the message
  const encrypted = box.after(messageUint8, nonce, key);
  
  // Combine nonce and encrypted message
  const fullMessage = new Uint8Array(nonce.length + encrypted.length);
  fullMessage.set(nonce);
  fullMessage.set(encrypted, nonce.length);
  
  // Encode as URL-safe base64
  return encodeURLSafe(fullMessage);
};

/**
 * Verifies and decodes an authentication token
 * @param token The encrypted authentication token
 * @returns The decoded AuthenticatedRequest or null if invalid
 */
export const verifyAuthToken = (token: string): AuthenticatedRequest | null => {
  try {
    // Decode the base64 token
    const fullMessage = decodeURLSafe(token);
    
    // Extract nonce and encrypted message
    const nonce = fullMessage.slice(0, box.nonceLength);
    const encrypted = fullMessage.slice(box.nonceLength);
    
    // Get the encryption key
    const key = getEncryptionKey();
    
    // Decrypt the message
    const decrypted = box.open.after(encrypted, nonce, key);
    if (!decrypted) {
      return null; // Decryption failed
    }
    
    // Convert Uint8Array to string and parse JSON
    const jsonString = uint8ArrayToString(decrypted);
    const request = JSON.parse(jsonString) as AuthenticatedRequest;
    
    // Check if the token is expired (e.g., valid for 1 hour)
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime - request.timestamp > 3600) {
      return null; // Token expired
    }
    
    return request;
  } catch (error) {
    console.error('Error verifying auth token:', error);
    return null;
  }
};
