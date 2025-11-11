// eslint.config.js
import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
        module: "readonly",
        require: "readonly",
        __dirname: "readonly",
        exports: "readonly",
      },
      sourceType: "module",
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off", // Cho phép dùng console.log
    },
  },
];
