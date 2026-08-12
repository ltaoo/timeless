import { resolve } from 'path'
import { createLibConfig } from '../../vite.config.base'
import pkg from './package.json'

export default createLibConfig({
  name: "timeless.biz",
  entry: resolve(__dirname, 'src/index.ts'),
  define: {
    __Version: JSON.stringify(pkg.version),
  },
  external: [
    "@timeless/inner-base",
    "@timeless/inner-kit",
    "@timeless/inner-vm",
    "@timeless/inner-utils",
  ],
   globals: {
    "@timeless/inner-base": "Timeless.base",
    "@timeless/inner-kit": "Timeless.kit",
    "@timeless/inner-vm": "Timeless.vm",
    "@timeless/inner-utils": "Timeless.utils",
  },
  alias: {
    '@': resolve(__dirname, 'src')
  }
})
