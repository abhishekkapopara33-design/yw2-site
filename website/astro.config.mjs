import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://yw2llc.com',
  output: 'static',
  build: {
    assets: '_astro',
  },
  vite: {
    build: {
      cssMinify: true,
    },
  },
});
