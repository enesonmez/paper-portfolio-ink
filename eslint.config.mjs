import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import { defineConfig } from "eslint/config";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default defineConfig(
  {
    ignores: [
      ".react-router/**",
      ".wrangler/**",
      "build/**",
      "coverage/**",
      "dist/**",
      "eslint.config.mjs",
      "node_modules/**",
      "playwright-report/**",
      "prettier.config.mjs",
      "scripts/**",
      "test-results/**",
    ],
  },
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.serviceworker,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ["tests/**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.jest,
        vi: "readonly",
      },
    },
  },
  eslintConfigPrettier,
);
