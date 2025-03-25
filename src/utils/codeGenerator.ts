
/**
 * Generates a random alphanumeric code of specified length
 * @param length Length of the code to generate (default 6)
 * @returns A random alphanumeric code
 */
export const generateRandomCode = (length: number = 6): string => {
  // Define characters to use (excluding ambiguous characters like 0, O, 1, I, etc.)
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  
  // Create a Uint32Array with one element
  const randomValues = new Uint32Array(length);
  
  // Fill it with random values
  window.crypto.getRandomValues(randomValues);
  
  // Use the random values to select characters
  for (let i = 0; i < length; i++) {
    result += characters.charAt(randomValues[i] % characters.length);
  }
  
  return result;
};
