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
    {
      name: 'ravioli-csp',
      apply: 'build',
      transformIndexHtml(html) {
        const csp = [
          "default-src 'self'",
          "script-src 'self'",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data: blob:",
          "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
          "worker-src 'self' blob:",
          "manifest-src 'self'",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join('; ');
        return html.replace(
          '<meta charset="UTF-8" />',
          `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${csp}" />`,
        );
      },
    },
    VitePWA({
      registerType: 'autoUpdate',
      manifestFilename: 'manifest.json',
      includeAssets: [
        'favicon.ico',
        'icon.svg',
        'apple-touch-icon-180x180.png',
        'badge.svg',
        'badge-96x96.png',
        'badge-72x72.png',
      ],
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
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion')) return 'motion';
            if (id.includes('@supabase')) return 'supabase';
            if (id.includes('canvas-confetti')) return 'confetti';
            if (id.includes('lucide-react')) return 'icons';
            return 'vendor';
          }
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
