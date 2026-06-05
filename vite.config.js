import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['barber-logo.png', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'BarBer Manager',
        short_name: 'BarBer',
        description: 'Système de gestion premium pour votre salon de coiffure',
        theme_color: '#08090d',
        background_color: '#08090d',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'barber-logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'barber-logo.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'barber-logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
