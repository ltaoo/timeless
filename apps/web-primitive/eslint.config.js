import { timelessGlobals } from "@timeless/types/eslint";

export default [
  {
    ignores: ["node_modules/**", "dist/**", "build/**", "public/**"],
  },
  {
    languageOptions: {
      globals: {
        ...timelessGlobals,
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
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "warn",
      semi: ["warn", "always"],
      indent: ["warn", 2, { ignoredNodes: ["TemplateLiteral"] }],
    },
  },
];
