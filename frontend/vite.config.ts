/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

function legacyScript() {
  const version = Date.now()
  return {
    name: 'legacy-script',
    transformIndexHtml(html) {
      return html
        .replace(/<script type="module" crossorigin src="([^"]+)"[^>]*><\/script>/g, `<script defer src="$1?v=${version}"></script>`)
        .replace(/<script type="module" src="([^"]+)"[^>]*><\/script>/g, `<script defer src="$1?v=${version}"></script>`)
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), legacyScript()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: { port: 5173 },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'node',
  },
})
