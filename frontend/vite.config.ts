import {defineConfig, type Plugin} from 'vite';
import react from '@vitejs/plugin-react';
import {VitePWA} from 'vite-plugin-pwa';
import {apiPlugin} from './src/server/api-plugin';

export default defineConfig({
  plugins: [
    react(),
    apiPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,png,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: {maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60},
            },
          },
        ],
      },
      manifest: {
        name: 'Zero Shopping List',
        short_name: 'Shopping',
        description: 'Real-time collaborative shopping list',
        theme_color: '#1a1a2e',
        background_color: '#0f0f1a',
        display: 'standalone',
        start_url: '/',
        icons: [
          {src: '/icon-192.png', sizes: '192x192', type: 'image/png'},
          {src: '/icon-512.png', sizes: '512x512', type: 'image/png'},
          {src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable'},
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
