import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
    watch: {
      ignored: ['**/*.mp4', '**/*.webm', '**/*.mov', '**/*.png', '**/*.jpg', '**/node_modules/**', '**/dist/**']
    }
  },
});
