import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
// import minifyHTML from '@lit-labs/rollup-plugin-minify-html-literals'

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    outDir: 'dist',
    lib: {
      entry: 'lib/index.ts',
      fileName: 'bundle',
      formats: ['es']
    },
    rollupOptions: {
      // plugins: [minifyHTML()],
      output: {
        manualChunks: undefined,
        assetFileNames: 'bundle.min.css',
        chunkFileNames: 'bundle.min.js',
        entryFileNames: 'bundle.min.js'
      }
    },
    minify: 'terser',
    sourcemap: true,
    cssMinify: true,
    target: 'es2022'
  }
})
