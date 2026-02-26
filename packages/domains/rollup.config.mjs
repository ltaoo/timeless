import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import alias from '@rollup/plugin-alias';
import terser from '@rollup/plugin-terser';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pkg = require('./package.json');

const removeConsole = terser({
  compress: {
    pure_funcs: ['console.log'],
    drop_debugger: true,
  },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        file: 'dist/index.esm.js',
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      alias({
        entries: [
          { find: '@', replacement: path.resolve(__dirname, 'src') },
        ]
      }),
      resolve(),
      commonjs(),
      typescript({ 
        tsconfig: './tsconfig.json',
        declaration: false,
        outDir: null,
        compilerOptions: {
          declaration: false,
          declarationMap: false,
          outDir: null,
        }
      }),
      removeConsole,
    ],
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/timeless.core.umd.min.js',
      format: 'umd',
      name: 'Timeless',
      sourcemap: true,
    },
    plugins: [
      alias({
        entries: [
          { find: '@', replacement: path.resolve(__dirname, 'src') },
        ]
      }),
      resolve({ browser: true }),
      commonjs(),
      typescript({ 
        tsconfig: './tsconfig.json',
        declaration: false,
        outDir: null,
        compilerOptions: {
          declaration: false,
          declarationMap: false,
          outDir: null,
        }
      }),
      removeConsole,
    ],
  },
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [
      alias({
        entries: [
          { find: '@', replacement: path.resolve(__dirname, 'src') },
        ]
      }),
      dts()
    ],
  },
];
