// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  output: 'server',  // SSR mode for Cloudflare Pages
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
    imageService: 'compile', // Optimize images with sharp during build time
  }),
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [react()],
  // Ensure proper module resolution
  build: {
    inlineStylesheets: 'auto'
  }
});