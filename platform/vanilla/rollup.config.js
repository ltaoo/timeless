import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  input: path.join(__dirname, "package/prosemirror/index.js"),
  output: {
    file: path.join(__dirname, "public/prosemirror.umd.min.js"),
    format: "umd",
    name: "ProsemirrorMod",
    globals: {
      ProsemirrorMod: "ProsemirrorMod",
    },
  },
  external: [],
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs({
      sourceMap: false,
    }),
    terser(),
  ],
};
