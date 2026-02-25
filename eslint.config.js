import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default [
  {
    ignores: ["dist/**", "node_modules/**", "*.min.js"],
  },
  {
    files: ["src/**/*.ts", "src/**/*.js"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      prettier,
    },
    rules: {
      // TypeScript
      ...tseslint.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "off", // le projet utilise any fréquemment
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-non-null-assertion": "warn",

      // Général
      "no-console": ["warn", { allow: ["warn", "error", "debug"] }],
      eqeqeq: ["error", "always"],
      "no-var": "error",
      "prefer-const": "warn",

      // Prettier en dernier pour écraser les règles de formatage
      ...prettierConfig.rules,
      "prettier/prettier": "error",
    },
  },
];
