// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://nishyoi.com',
  // ページは静的生成のまま。/api/ のエンドポイントだけ prerender=false で
  // Cloudflare Pages Functions として動く
  output: 'static',
  adapter: cloudflare({ imageService: 'compile' }),
  vite: {
    plugins: [tailwindcss()],
  },
});
