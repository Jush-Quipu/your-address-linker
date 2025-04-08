
/**
 * Polyfills for browser compatibility
 */

// Buffer for crypto operations
import { Buffer } from 'buffer';

// Make Buffer available globally
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
}

// Create a global process object for libraries expecting Node.js environment
if (typeof window !== 'undefined' && !window.process) {
  window.process = { env: {} };
}

// Log confirmation that polyfills are loaded
console.log('Polyfills loaded successfully');

export {};
