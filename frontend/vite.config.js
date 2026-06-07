import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Every request starting with /api is forwarded to the backend
      '/api': {
        target: 'https://shopwave-eccomerce.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});