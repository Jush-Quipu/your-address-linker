// Import the actual buffer package
import { Buffer as BufferPolyfill } from 'buffer';

// Import our utility polyfills
import utilPolyfill from './polyfills/util';
import streamPolyfill from './polyfills/stream';

// Polyfills for Node.js globals that are needed by libraries
if (typeof window !== 'undefined') {
  // Provide global object for libraries that expect Node.js environment
  window.global = window;
  
  // Other common Node.js globals that might be needed
  window.process = window.process || { env: {} };
  
  // Use the actual buffer package instead of our own implementation
  window.Buffer = BufferPolyfill;

  // Add polyfill for util
  window.util = utilPolyfill;
  
  // Add polyfill for stream
  window.stream = streamPolyfill;
  
  console.log('Polyfills registered successfully');
}

export default function registerPolyfills() {
  // This function is imported in main.tsx to ensure polyfills are registered
  console.log('Polyfills registration function called');
}
