/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',   // users get a "Reload for new version" button
      injectRegister: 'auto',
      includeAssets: [
        'favicon.png',
        'apple-touch-icon.png',
        'logo_name.png',
      ],
      manifest: {
        name: 'Acadrix - Scholar Metric',
        short_name: 'Acadrix',
        description: 'Multi-role school management platform for K-12 institutions in India.',
        theme_color: '#2b5ab5',
        background_color: '#f8f9fa',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'en-IN',
        dir: 'ltr',
        categories: ['education', 'productivity'],
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-maskable-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Pre-cache all bundle assets at install time
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Never try to pre-cache the big logo file
        globIgnores: ['**/logo_name.png'],
        // Fall back to offline.html when navigation requests fail
        navigateFallback: '/offline.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/django-admin\//],
        runtimeCaching: [
          // API requests: always prefer network, but cache successful GETs for
          // 5 min so a brief offline hiccup still shows recent data
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'acadrix-api',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 5 * 60,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Google Fonts CSS
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-css',
              expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 },
            },
          },
          // Google Fonts files
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-files',
              expiration: { maxEntries: 30, maxAgeSeconds: 365 * 24 * 60 * 60 },
            },
          },
        ],
      },
      devOptions: {
        // Enable SW in dev for testing. Disable if it causes reload loops.
        enabled: false,
        type: 'module',
      },
    }),
  ],
  build: {
    // Route-based lazy loading would drop this further, but 107KB gzipped
    // for the app shell is fine. Bump threshold to silence the warning.
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          // React + router: ~55KB gzipped, almost never changes
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Data / forms layer: ~50KB gzipped
          'vendor-data': [
            '@tanstack/react-query',
            '@tanstack/react-query-devtools',
            'axios',
            'react-hook-form',
            '@hookform/resolvers',
            'zod',
          ],
          // Recharts is heavy (~85KB gzipped). Splitting it means dashboards
          // that don't use it skip the download entirely.
          'vendor-charts': ['recharts'],
          // Tour library is lazy-used (only on first visit)
          'vendor-tour': ['react-joyride'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: false,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
