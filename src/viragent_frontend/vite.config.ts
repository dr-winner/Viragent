import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",
    port: 5175,
    cors: true,
    proxy: {
      // Proxy API calls to avoid CORS issues
      '/api': {
        target: 'http://localhost:4943',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: [
      '@dfinity/agent',
      '@dfinity/auth-client',
      '@dfinity/identity',
      '@dfinity/principal',
      '@dfinity/candid',
      '@dfinity/vetkeys'
    ],
  },
  define: {
    global: 'globalThis',
  },
}));
