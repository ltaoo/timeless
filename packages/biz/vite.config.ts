import { resolve } from 'path'
import { createLibConfig } from '../../vite.config.base'
import pkg from './package.json'

export default createLibConfig({
  name: "timeless.biz",
  entry: resolve(__dirname, 'src/index.ts'),
  external: [
    "@timeless/base",
    "@timeless/kit",
    "@timeless/ui",
    "@timeless/utils",
  ],
   globals: {
    "@timeless/base": "Timeless.base",
    "@timeless/kit": "Timeless.kit",
    "@timeless/ui": "Timeless.ui",
    "@timeless/utils": "Timeless.utils",
  },
  alias: {
    '@': resolve(__dirname, 'src')
  }
})
