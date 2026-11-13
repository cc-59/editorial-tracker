import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Listens on all interfaces in a container because the host must reach the dev server.
    host: process.env.VITE_HOST === 'all' ? true : undefined,
    // Proxies /api because one origin needs no CORS setup.
    proxy: { '/api': 'http://localhost:3001' },
  },
});
