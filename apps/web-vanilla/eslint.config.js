import { globals as timelessGlobals } from "@timeless/dev/eslint";

export default [
  {
    ignores: ["node_modules/", "dist/", "build/", "public/"],
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        NavigatorCore: "readonly",
        fetch: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        URLSearchParams: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearTimeout: "readonly",
        clearInterval: "readonly",
        alert: "readonly",
        TimelessWeb: "readonly",
        ...timelessGlobals,
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "warn",
      semi: ["warn", "always"],
      indent: [
        "warn",
        2,
        { ignoreComments: true, ignoredNodes: ["TemplateLiteral > *"] },
      ],
    },
  },
];
