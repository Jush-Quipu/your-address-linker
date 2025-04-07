// Import the actual buffer package
import { Buffer as BufferPolyfill } from 'buffer';

// Polyfills for Node.js globals that are needed by some libraries
if (typeof window !== 'undefined') {
  // Provide global object for libraries that expect Node.js environment
  window.global = window;
  
  // Other common Node.js globals that might be needed
  // Use a type assertion to avoid TypeScript errors with Process type
  window.process = window.process || { env: {} } as any;
  
  // Use the actual buffer package instead of our own implementation
  if (!window.Buffer) {
    window.Buffer = BufferPolyfill;
  }
}

export default function registerPolyfills() {
  // This function can be empty, it's just to ensure the file is imported
  console.log('Polyfills registered');
}
