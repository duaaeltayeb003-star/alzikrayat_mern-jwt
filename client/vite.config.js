import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// During development, requests to /api and /uploads are forwarded to the Express server,
// so the client can call fetch('/api/photos') without CORS or full URLs.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    },
  },
});
