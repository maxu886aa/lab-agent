import path from 'path'
import { defineConfig } from '@lark-apaas/coding-preset-vite-react'

export default defineConfig({
  build: {
    outDir: 'dist',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@shared': path.resolve(__dirname, 'shared'),
    },
  },
})
