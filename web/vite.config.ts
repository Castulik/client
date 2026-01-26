import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa' // <-- 1. Importovat toto

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 2. Přidat celou tuto sekci VitePWA
    VitePWA({ 
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Můj Nákupní Optimalizátor',
        short_name: 'Nakupák',
        description: 'Aplikace pro nejlevnější nákupy',
        display: 'standalone',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  // 👇 TUTO ČÁST PŘIDEJ:
  preview: {
    host: true,  // Tohle povolí přístup z mobilu
    port: 4173   // (Volitelné) Pevný port
  },
  server: {      // Tohle je pro 'npm run dev'
    host: true
  }
})