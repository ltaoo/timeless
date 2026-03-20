import { resolve } from 'path'
import { createLibConfig } from '../../vite.config.base'
import pkg from './package.json'

export default createLibConfig({
  name: "timeless.biz",
  entry: resolve(__dirname, 'src/index.ts'),
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {})
  ],
  alias: {
    '@': resolve(__dirname, 'src')
  }
})
