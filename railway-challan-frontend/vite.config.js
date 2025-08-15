import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export const theme = {
  colors: {
    primary: {
      blue: "#1E40AF",
      light: "#3B82F6",
      dark: "#1E3A8A",
    },
    secondary: {
      successGreen: "#10B981",
      successLight: "#34D399",
      dangerRed: "#EF4444",
      dangerLight: "#FB7181",
    },
    accent: {
      orange: "#F97316",
      light: "#FB923C",
    },
    neutral: {
      gray50: "#F9FAFB",
      gray100: "#F3F4F6",
      gray200: "#E5E7EB",
      gray300: "#D1D5DB",
      gray400: "#9CA3AF",
      gray500: "#6B7280",
      gray600: "#4B5563",
      gray700: "#374151",
      gray800: "#1F2937",
      gray900: "#111827",
    }
  },
  typography: {
    fontFamily: "NotoSansHans, sans-serif",
    headings: {
      h1: { size: "48px", weight: "bold" },
      h2: { size: "36px", weight: "bold" },
      h3: { size: "24px", weight: "500" },
      h4: { size: "20px", weight: "500" },
    },
    body: {
      regular: { size: "16px", weight: "400" },
      small: { size: "14px", weight: "400" },
      large: { size: "18px", weight: "400" },
    },
    label: { size: "14px", weight: "500" },
    button: { size: "16px", weight: "500" },
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    "2xl": "48px",
  }
}

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
      theme_color: theme.colors.primary.blue,
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
