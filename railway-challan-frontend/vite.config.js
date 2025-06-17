import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react(),
  VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.svg', 'robots.txt'],
    manifest: {
      name: 'Railway Challan App',
      short_name: 'Challan',
      description: 'Issue and view challans offline/online',
      theme_color: '#1E40AF',
      icons: [
        { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' }
      ]
    },
    workbox: {
      runtimeCaching: [
        {
          urlPattern: ({ url }) => url.origin === self.location.origin && /\/api\//.test(url.pathname),
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: { maxEntries: 50, maxAgeSeconds: 86400 }
          }
        },
        {
          urlPattern: ({ request }) => request.destination === 'document' || request.destination === 'script' || request.destination === 'style',
          handler: 'StaleWhileRevalidate',
          options: { cacheName: 'assets-cache', expiration: { maxEntries: 100, maxAgeSeconds: 86400 * 7 } }
        },
        {
          urlPattern: /\/api\/challan\/issue/,
          handler: 'NetworkOnly',
          options: {
            backgroundSync: {
              name: 'challan-queue',
              options: {
                maxRetentionTime: 24 * 60 // Retry for max 24 hours
              }
            }
          }
        }

      ]
    }
  })
  ],
})
