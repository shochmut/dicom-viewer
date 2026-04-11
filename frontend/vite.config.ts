import react from '@vitejs/plugin-react'
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), viteCommonjs()],
  optimizeDeps: {
    exclude: [
      '@cornerstonejs/dicom-image-loader',
      '@cornerstonejs/codec-libjpeg-turbo-8bit',
    ],
    include: ['dicom-parser'],
  },
  worker: {
    format: 'es',
    rollupOptions: {
      external: ['@icr/polyseg-wasm'],
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
