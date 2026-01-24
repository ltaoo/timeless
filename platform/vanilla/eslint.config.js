export default [
  {
    ignores: ["node_modules/", "dist/", "build/", "public/"]
  },
  {
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
        Timeless: "readonly",
        TimelessWeb: "readonly",
        View: "readonly",
        Flex: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "warn",
      "no-define": "error",
      "semi": ["error", "always"],
      "indent": ["error", 2, { "ignoreComments": true, "ignoredNodes": ["TemplateLiteral > *"] }]
    }
  }
];
