import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Same origin in dev, so the browser needs no CORS setup.
    proxy: { '/api': 'http://localhost:3001' },
  },
});
