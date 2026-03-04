import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const minify = terser({
  compress: {
    drop_console: true,
    drop_debugger: true,
    pure_funcs: ["console.log"], // Ensures console.log is removed even if drop_console is false in some configs
  },
  mangle: {
    toplevel: true,
  },
  format: {
    comments: false,
  },
});

const config = {
  input: path.join(__dirname, "src/index.ts"),
  output: [
    {
      file: path.join(__dirname, "dist/timeless.vanillalite.umd.min.js"),
      format: "umd",
      name: "Timeless",
      extend: true,
      sourcemap: true,
      // No globals because we bundle everything
    },
    {
      file: path.join(__dirname, "dist/timeless.vanillalite.esm.js"),
      format: "es",
      sourcemap: true,
    },
  ],
  // No external because we want a full bundle
  plugins: [
    typescript({
      compilerOptions: {
        noUnusedLocals: false,
        noUnusedParameters: false,
      },
    }),
    resolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs({
      sourceMap: false,
    }),
    minify,
  ],
};

export default (args) => {
  if (args.whole) delete args.whole;
  return config;
};
