import { defineConfig } from 'vite';

export default defineConfig({
  root: './preview',
  server: {
    port: 5175,
    host: '0.0.0.0',
    strictPort: true,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    watch: {
      usePolling: true,
      interval: 100
    }
  },
});
