import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logoapp.png'],
      manifest: {
        name: 'D&A Gestão Financeira',
        short_name: 'D&A Finance',
        description: 'Plataforma completa de gestão financeira pessoal e empresarial',
        theme_color: '#4f378a',
        background_color: '#fdf7ff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'logoapp.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logoapp.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
