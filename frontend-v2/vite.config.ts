import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@services': '/src/services',
      '@types': '/src/types',
      '@utils': '/src/utils',
      '@hooks': '/src/hooks',
      '@config': '/src/config',
      '@store': '/src/store',
      '@assets': '/src/assets',
      '@styles': '/src/styles',
      '@layouts': '/src/layouts',
    },
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'https://localhost:7001',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          antd: ['antd', '@ant-design/icons'],
          charts: ['chart.js', 'react-chartjs-2'],
          animation: ['framer-motion'],
          forms: ['react-hook-form', '@hookform/resolvers'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'antd', 'framer-motion'],
  },
  define: {
    __APP_VERSION__: JSON.stringify('2.0.0'),
  },
})
