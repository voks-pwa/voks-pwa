import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { imagetools } from 'vite-imagetools'

export default defineConfig({
  optimizeDeps: {
    include: ['react', 'react-dom', 'swiper/react', 'swiper/modules'],
  },
  plugins: [
    react(),
    tailwindcss(),
    imagetools(),
    VitePWA({
      registerType: 'autoUpdate',

      includeAssets: [
        'favicon.svg',
        'icon-192.png',
        'icon-512.png',
        'maskable-192.png',
        'maskable-512.png',
        'manifest.webmanifest',
      ],

      manifest: {
        id: '/',
        name: 'Voks Radio',
        short_name: 'Voks',
        description:
          'Listen to Voks Radio Bandung — live streaming and on-air music.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#BDA752',
        background_color: '#FFFFFF',

        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/maskable-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      manifestFilename: 'manifest.webmanifest',

      workbox: {
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,webp,woff2,webmanifest}',
        ],

        navigateFallback: 'index.html',

        navigateFallbackDenylist: [/^\/api\//],

        runtimeCaching: [
          {
            urlPattern: /^https:\/\/a7\.alhastream\.com\/.*/i,

            handler: 'NetworkFirst',

            options: {
              cacheName: 'azuracast-api-cache',

              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 5,
              },

              networkTimeoutSeconds: 5,

              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/voksradio\.com\/wp-json\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'wordpress-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'supabase-rest-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },

      devOptions: {
        enabled: true,
        navigateFallback: 'index.html',
      },
    }),
  ],

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/react-router-dom')) {
            return 'vendor-router';
          }
          if (id.includes('node_modules/@tanstack/react-query')) {
            return 'vendor-query';
          }
          if (id.includes('node_modules/@supabase/supabase-js')) {
            return 'vendor-supabase';
          }
          if (id.includes('node_modules/recharts')) {
            return 'vendor-charts';
          }
          if (id.includes('node_modules/pdfjs-dist') || id.includes('node_modules/pdf-parse')) {
            return 'vendor-pdf';
          }
          if (id.includes('node_modules/swiper')) {
            return 'vendor-swiper';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
        },
      },
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})