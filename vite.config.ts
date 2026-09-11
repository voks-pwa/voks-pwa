import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { imagetools } from 'vite-imagetools'

export default defineConfig({
  server: {
    proxy: {
      '/song_update.php': {
        target: 'https://voksradio.com',
        changeOrigin: true,
        secure: true,
      },
      '/wp-json': {
        target: 'https://voksradio.com',
        changeOrigin: true,
        secure: true,
      },
      '/hls': {
        target: 'https://live.voksradio.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'swiper/react', 'swiper/modules'],
  },
  plugins: [
    react(),
    tailwindcss(),
    imagetools(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',

      includeAssets: [
        'favicon.svg',
        'icon-192.png',
        'icon-512.png',
        'maskable-192.png',
        'maskable-512.png',
        'manifest.webmanifest',
        'offline.html',
      ],

      manifest: {
        id: '/',
        name: 'Voks Radio — New Experience Transformation',
        short_name: 'Voks',
        description: 'Voks Radio Bandung — live streaming, podcast, missions & rewards.',
        start_url: '/?source=pwa',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#BDA752',
        background_color: '#FFFFFF',
        categories: ['music', 'entertainment', 'radio'],
        lang: 'id',
        dir: 'ltr',
        handle_links: 'preferred',
        launch_handler: { client_mode: 'navigate-existing' } as never,
        shortcuts: [
          { name: 'Live Studio', short_name: 'Live', description: 'Tonton live studio', url: '/live', icons: [{ src: '/icon-192.png', sizes: '192x192' }] },
          { name: 'Missions', short_name: 'Misi', description: 'Selesaikan misi & kumpulkan VXP', url: '/missions', icons: [{ src: '/icon-192.png', sizes: '192x192' }] },
          { name: 'Programs', short_name: 'Program', description: 'Jelajahi semua program', url: '/programs', icons: [{ src: '/icon-192.png', sizes: '192x192' }] },
        ],
        screenshots: [
          { src: '/splash-screen.png', sizes: '2048x2732', type: 'image/png', form_factor: 'wide' as const, label: 'Voks Home' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', form_factor: 'narrow' as const, label: 'Voks Icon' },
        ],
        share_target: {
          action: '/share',
          method: 'GET',
          params: { title: 'title', text: 'text', url: 'url' },
        } as never,
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
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2,webmanifest}'],
      },

      workbox: {
        navigateFallback: 'offline.html',

        navigateFallbackDenylist: [/^\/api\//, /^\/functions\//],

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
            urlPattern: /^http:\/\/a7\.alhastream\.com:81\/.*/i,

            handler: 'NetworkFirst',

            options: {
              cacheName: 'azuracast-api-cache-http',

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
            urlPattern: /^https:\/\/voksradio\.com\/wp-json\/wp\/v2\/notification.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'wp-notification-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/voksradio\.com\/wp-json\/.*/i,
            handler: 'StaleWhileRevalidate',
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
        enabled: false,
        navigateFallback: 'index.html',
        suppressWarnings: true,
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