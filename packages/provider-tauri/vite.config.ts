import { resolve } from 'path'
import { createLibConfig } from '../../vite.config.base'
import pkg from './package.json'

export default createLibConfig({
  entry: resolve(__dirname, 'src/index.ts'),
  name: 'timeless.tauri',
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {})
  ],
  globals: {
    '@tauri-apps/api': 'tauri.api',
    '@timeless/reactive': 'Timeless.reactive',
    '@timeless/timeless': 'Timeless',
    '@timeless/kit': 'Timeless',
    '@timeless/ui': 'Timeless.ui'
  },
  formats: ['es', 'cjs', 'umd'],
  minify: true,
  alias: {
    '@': resolve(__dirname, 'src')
  }
})
