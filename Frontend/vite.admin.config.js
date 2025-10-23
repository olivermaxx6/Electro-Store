import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react({
    jsxRuntime: 'automatic',
    jsxImportSource: 'react'
  })],
  root: 'src/admin',
  publicDir: '../../public',
  base: '/',
  build: {
    outDir: '../../dist/admin',
    emptyOutDir: true,
  },
  preview: {
    port: 5174,
    strictPort: true,
  },
  server: {
    host: '127.0.0.1',
    port: 5174,
    strictPort: true,
    open: false,
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
      '@': path.resolve(__dirname, 'src/admin'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@theme': path.resolve(__dirname, 'src/theme'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@styles': path.resolve(__dirname, 'src/styles'),
    }
  }
})
