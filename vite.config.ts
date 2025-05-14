import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Output source maps for easier debugging
    sourcemap: true,
    // Optimize output size
    minify: 'terser',
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    terserOptions: {
      compress: {
        // Safe optimizations
        drop_console: false,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Group vendor dependencies
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('gsap')) {
              return 'vendor-gsap';
            }
            if (id.includes('three') || id.includes('@react-three')) {
              return 'vendor-three';
            }
            return 'vendor-other';
          }
          
          // Group component chunks
          if (id.includes('/components/')) {
            return 'ui-components';
          }
          
          // Group feature pages
          if (id.includes('/pages/features/')) {
            return 'pages-features';
          }
          
          // Group product pages
          if (id.includes('/pages/') && (id.includes('ProductsPage') || id.includes('ProductDetailPage'))) {
            return 'pages-products';
          }
          
          // Group utility files
          if (id.includes('/utils/')) {
            return 'app-utils';
          }
        }
      }
    }
  },
  server: {
    // Enable proper HMR for development
    hmr: true,
    // Set port
    port: 3001,
    // Enable CORS
    cors: true,
    // Specify host for network access
    host: true
  },
})
