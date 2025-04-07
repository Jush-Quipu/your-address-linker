// Polyfills for Node.js globals that are needed by some libraries
if (typeof window !== 'undefined') {
  // Provide global object for libraries that expect Node.js environment
  window.global = window;
  
  // Other common Node.js globals that might be needed
  // Use a type assertion to avoid TypeScript errors with Process type
  window.process = window.process || { env: {} } as any;
  
  // Instead of using require for Buffer, we'll create it if it doesn't exist
  if (!window.Buffer) {
    // Create a simple Buffer polyfill or import it dynamically
    window.Buffer = {
      from: (data: string, encoding?: string) => {
        return new Uint8Array([...data].map(char => char.charCodeAt(0)));
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
