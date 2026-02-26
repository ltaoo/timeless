import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json'));

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'dist/index.mjs',
        format: 'es',
        sourcemap: true,
      }
    ],
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' })
    ]
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/timeless.web.umd.min.js',
      format: 'umd',
      name: 'Timeless.Web',
      sourcemap: true,
    },
    plugins: [
      resolve({ browser: true }),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' }),
      terser()
    ]
  }
];
