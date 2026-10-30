/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// Automatically use `/<repo-name>/` when building on GitHub Actions for GitHub Pages,
// and `/` when running locally.
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const base = repoName ? `/${repoName}/` : '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifestFilename: 'manifest.json',
      includeAssets: ['favicon.ico', 'icon.svg', 'apple-touch-icon-180x180.png'],
      devOptions: {
        // Lets you test installability + offline caching while running `npm run dev`.
        enabled: true,
        type: 'module',
      },
      manifest: {
        id: base,
        name: 'Ravioli — Oli the Cat',
        short_name: 'Oli',
        description: 'A cozy co-op virtual cat. Feed, cuddle and nap with Oli together in real time.',
        lang: 'en',
        start_url: base,
        scope: base,
        display: 'standalone',
        display_override: ['standalone', 'fullscreen'],
        orientation: 'portrait',
        theme_color: '#fbe3cb',
        background_color: '#fff6ec',
        categories: ['games', 'entertainment', 'lifestyle'],
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        globIgnores: ['**/version.json'],
        navigateFallback: `${base}index.html`,
        // Never cache Supabase API / realtime traffic or version.json.
        navigateFallbackDenylist: [/^\/rest\//, /^\/realtime\//, /version\.json$/],
      },
    }),
  ],
  server: {
    port: 5173,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
