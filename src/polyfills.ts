
// Polyfills for Node.js globals that are needed by some libraries
if (typeof window !== 'undefined') {
  // Provide global object for libraries that expect Node.js environment
  window.global = window;
  
  // Other common Node.js globals that might be needed
  // Use a type assertion to avoid TypeScript errors with Process type
  window.process = window.process || { env: {} } as any;
  
  // Instead of using require for Buffer, we'll create it if it doesn't exist
  if (!window.Buffer) {
    // Create a more robust Buffer polyfill
    window.Buffer = {
      from: (data: any, encoding?: string) => {
        // Handle string inputs
        if (typeof data === 'string') {
          return new Uint8Array([...data].map(char => char.charCodeAt(0)));
        }
        // Handle array-like or ArrayBuffer
        else if (data instanceof Uint8Array || Array.isArray(data)) {
          return new Uint8Array(data);
        }
        // Handle ArrayBuffer
        else if (data instanceof ArrayBuffer) {
          return new Uint8Array(data);
        }
        // Default fallback
        return new Uint8Array();
      },
      isBuffer: (obj: any) => false,
      alloc: (size: number) => new Uint8Array(size)
    } as any;
  }
}

export default function registerPolyfills() {
  // This function can be empty, it's just to ensure the file is imported
  console.log('Polyfills registered');
}
