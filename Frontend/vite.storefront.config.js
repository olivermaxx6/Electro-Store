import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: 'src/storefront',
  build: {
    outDir: '../../dist/storefront',
    emptyOutDir: true,
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
        secure: false,
      },
      '/media': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-redux', 
      'redux-persist', 
      'react-router-dom',
      'zustand', 
      'axios', 
      'socket.io-client',
      '@stripe/stripe-js',
      'lucide-react',
      'recharts'
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/storefront'),
      '@shared': path.resolve(__dirname, 'src'),
    }
  }
})
