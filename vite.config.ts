import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'animation-vendor': ['framer-motion', '@react-spring/web'],
          'ui-vendor': ['lucide-react', 'swiper', '@radix-ui/react-dialog', '@radix-ui/react-tooltip', '@radix-ui/react-hover-card'],
          'utils-vendor': ['react-use-measure', 'react-use-gesture', 'react-virtualized', 'react-intersection-observer']
        }
      }
    }
  },
  server: {
    hmr: true,
    watch: {
      usePolling: true
    }
  },
  publicDir: 'public',
  esbuild: {
    jsxInject: `import React from 'react'`
  }
});