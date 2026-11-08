import { defineConfig } from 'vite';

export default defineConfig({
  root: './preview',
  server: {
    port: parseInt(process.env.PORT || process.env.PREVIEW_PORT || '5175', 10),
    host: '0.0.0.0',
    strictPort: true,
    fs: {
      allow: ['..']
    },
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
