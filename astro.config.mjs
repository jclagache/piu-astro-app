// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  output: 'static',  // Use static mode instead of SSR
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [react()],
  // Ensure proper module resolution
  build: {
    inlineStylesheets: 'auto'
  }
});