import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['mazagan-logo.png', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Mazagan Barbershop Management',
        short_name: 'Mazagan',
        description: 'Système de gestion premium pour les salons Mazagan',
        theme_color: '#08090d',
        background_color: '#08090d',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'mazagan-logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'mazagan-logo.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'mazagan-logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
