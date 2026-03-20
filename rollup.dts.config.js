import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
  {
    input: path.join(__dirname, 'package/prosemirror/index.js'),
    output: {
      file: path.join(__dirname, 'public/prosemirror.umd.min.js'),
      format: 'umd',
      name: 'ProseMirror',
      globals: {
        'prosemirror-transform': 'prosemirrorTransform',
        'prosemirror-model': 'prosemirrorModel',
        'prosemirror-state': 'prosemirrorState',
        'rope-sequence': 'RopeSequence'
      }
    },
    external: [
      'prosemirror-transform',
      'prosemirror-model', 
      'prosemirror-state',
      'rope-sequence'
    ],
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs({
        sourceMap: false
      })
    ]
  },
  {
    input: path.join(__dirname, 'package/prosemirror/index.js'),
    output: {
      file: path.join(__dirname, 'public/prosemirror.d.ts'),
      format: 'es'
    },
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      dts({
        respectExternal: true
      })
    ]
  }
];
