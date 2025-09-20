// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  output: 'static',  // Keep static mode
  vite: {
    plugins: [tailwindcss()],
    define: {
      global: 'globalThis',
    },
    resolve: {
      alias: {
        buffer: 'buffer',
      },
    },
    optimizeDeps: {
      include: ['buffer', '@solana/web3.js'],
    },
  },
  integrations: [react()],
  build: {
    inlineStylesheets: 'auto'
  }
});