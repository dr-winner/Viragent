import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
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
      '@dfinity/candid'
    ],
  },
  define: {
    global: 'globalThis',
  },
}));
