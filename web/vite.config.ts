import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Inside a container the dev server must listen on all interfaces to be reachable from the host.
    host: process.env.VITE_HOST === 'all' ? true : undefined,
    // Same origin in dev, so the browser needs no CORS setup.
    proxy: { '/api': 'http://localhost:3001' },
  },
});
