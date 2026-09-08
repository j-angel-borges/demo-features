import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { zentrySyncPlugin } from '../../packages/shared/src/viteSyncPlugin';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), zentrySyncPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@zentry/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    emptyOutDir: true,
  },
});
