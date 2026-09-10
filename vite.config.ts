import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/Cheqino/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      manifest: {
        id: '/Cheqino/',
        name: 'چکینو - یادآور چک',
        short_name: 'چکینو',
        description: 'مدیریت و یادآوری چک‌های پرداختی و دریافتی',
        lang: 'fa',
        dir: 'rtl',
        theme_color: '#8b2fe0',
        background_color: '#f6f5f1',
        display: 'standalone',
        start_url: '/Cheqino/',
        scope: '/Cheqino/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
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
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
      },
    }),
  ],
})
