// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://nishyoi.com',
  integrations: [sitemap()],
  // ページは静的生成のまま。/api/ のエンドポイントだけ prerender=false で
  // Cloudflare Pages Functions として動く
  output: 'static',
  adapter: cloudflare(),
  vite: {
    plugins: [tailwindcss()],
  },
});
