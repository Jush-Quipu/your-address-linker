
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      'buffer': 'buffer',
      'util': path.resolve(__dirname, './src/polyfills/util.js'),
      'stream': path.resolve(__dirname, './src/polyfills/stream.js'),
    },
  },
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
      // Enable esbuild polyfill for Node.js modules
      plugins: [
        {
          name: 'node-globals',
          setup(build) {
            // Polyfill Node.js globals
            build.onResolve({ filter: /^util$/ }, () => {
              return { path: path.resolve(__dirname, './src/polyfills/util.js') };
            });
            build.onResolve({ filter: /^stream$/ }, () => {
              return { path: path.resolve(__dirname, './src/polyfills/stream.js') };
            });
          },
        },
      ],
    },
  },
}));
