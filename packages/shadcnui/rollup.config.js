import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import postcss from "rollup-plugin-postcss";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
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
      file: path.join(__dirname, "dist/timeless.shadcn.umd.min.js"),
      format: "umd",
      name: "Timeless.shadcn",
      extend: true,
      globals: {
        "@timeless/reactive": "Timeless.reactive",
        "@timeless/headless": "Timeless.headless",
        "@timeless/kit": "Timeless",
        "@timeless/ui": "Timeless.ui",
      },
      footer: `if (typeof window !== "undefined") {
        window.Timeless = window.Timeless || {};
        if (window.Timeless.shadcn) {
          Object.assign(window, window.Timeless.shadcn);
        }
      }`,
    },
    {
      file: path.join(__dirname, "dist/timeless.shadcn.esm.js"),
      format: "es",
    },
  ],
  external: [
    "@timeless/reactive",
    "@timeless/headless",
    "@timeless/kit",
    "@timeless/ui",
  ],
  plugins: [
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: true,
      declarationDir: "./dist",
    }),
    postcss({
      extract: path.join(__dirname, "dist/timeless.shadcnui.css"),
      minimize: true,
      plugins: [
        tailwindcss(path.resolve(__dirname, "./tailwind.config.js")),
        autoprefixer(),
      ],
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
