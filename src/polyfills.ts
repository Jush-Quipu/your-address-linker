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
}

export default function registerPolyfills() {
  // This function can be empty, it's just to ensure the file is imported
  console.log('Polyfills registered');
}
