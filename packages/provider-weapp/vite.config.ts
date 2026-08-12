import { resolve } from 'path'
import { createLibConfig } from '../../vite.config.base'
import pkg from './package.json'

export default createLibConfig({
  dts: true,
  entry: resolve(__dirname, 'src/index.ts'),
  name: 'timeless.weapp',
  define: {
    __Version: JSON.stringify(pkg.version),
  },
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {})
  ],
  globals: {
    '@timeless/inner-reactive': 'Timeless.reactive',
    '@timeless/inner-kit': 'Timeless.kit',
    '@timeless/inner-vm': 'Timeless.vm'
  },
  formats: ['es', 'cjs', 'umd'],
  minify: true,
  alias: {
    '@': resolve(__dirname, 'src')
  }
})
