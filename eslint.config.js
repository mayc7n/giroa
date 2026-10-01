// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");
const typescriptEslint = require('@typescript-eslint/eslint-plugin');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: ['variable', 'function', 'parameter'],
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'import',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        },
        {
          selector: ['property', 'objectLiteralProperty'],
          modifiers: ['requiresQuotes'],
          format: null,
        },
        {
          selector: ['property', 'typeProperty', 'objectLiteralProperty', 'classProperty'],
          format: ['camelCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
        },
        {
          selector: ['method', 'accessor', 'objectLiteralMethod', 'classMethod'],
          format: ['camelCase', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
      ],
    },
  },
  {
    files: [
      "src/data/**/*.{ts,tsx}",
      "__tests__/data/**/*.ts",
      "src/ui/tokens.ts",
      "__tests__/ui/tokens.test.ts",
    ],
    rules: {
      '@typescript-eslint/naming-convention': 'off',
    },
  },
]);
