import { resolve } from 'path'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import pkg from './package.json'

export default defineConfig({
  plugins: [
    solid()
  ],
  resolve: {
    alias: {
      '@/kit': '@timeless/kit',
      '@/biz': '@timeless/biz',
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => format === 'es' ? 'index.esm.js' : 'index.cjs.js'
    },
    sourcemap: true,
    rollupOptions: {
      external: [
        'solid-js',
        'solid-js/web',
        'solid-js/store',
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {})
      ]
    }
  }
})
