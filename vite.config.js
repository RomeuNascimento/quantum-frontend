import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['apple-touch-icon.png', 'brand/favicon.svg'],
      manifest: {
        name: 'Quantum — Gestão de Confeitaria',
        short_name: 'Quantum',
        description: 'Gestão de custos e precificação para confeiteiros',
        theme_color: '#0B0B0F',
        background_color: '#F4EFE3',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        // SEM skipWaiting/clientsClaim — anulariam o registerType 'prompt'
        // (o SW novo assumiria sob a página antiga → mismatch de assets)
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          // Fontes Google — stylesheet (muda raramente)
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          // Fontes Google — arquivos de fonte (imutáveis por URL)
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          // API Quantum — GETs com fallback para cache
          {
            urlPattern: ({ request }) =>
              /^https:\/\/api\.quantumcalc\.com\.br\//i.test(request.url) &&
              request.method === 'GET',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 150, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
  },
})
