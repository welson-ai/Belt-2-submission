import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// BELT-2 Vite Configuration
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@creit.tech/stellar-wallets-kit'],
  },
  build: {
    commonjsOptions: {
      include: [/@creit.tech\/stellar-wallets-kit/, /node_modules/],
    },
  },
  server: {
    port: 3000,
    host: true
  }
})
