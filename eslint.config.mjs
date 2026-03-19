import { defineConfig } from 'eslint/config';
import eslintJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import nextPlugin from '@next/eslint-plugin-next';
import globals from 'globals';

export default defineConfig([
  // 1. Ignores globales
  {
    name: 'project/ignores',
    ignores: ['.next/**', 'node_modules/**', 'public/**', 'next-env.d.ts'],
  },

  // 2. ESLint recommended base (JS/TS/TSX)
  {
    name: 'project/js-recommended',
    files: ['**/*.{js,mjs,ts,tsx}'],
    ...eslintJs.configs.recommended,
  },

  // 3. typescript-eslint strict + stylistic (solo TS/TSX)
  ...tseslint.config({
    name: 'project/typescript',
    files: ['**/*.{ts,tsx}'],
    extends: [
      tseslint.configs.strict,
      tseslint.configs.stylistic,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  }),

  // 4. Deshabilitar type-checking en archivos de config
  ...tseslint.config({
    name: 'project/disable-type-checked-js',
    files: ['**/*.{js,mjs}'],
    extends: [tseslint.configs.disableTypeChecked],
  }),

  // 5. React + hooks + jsx-a11y (JS/TS/TSX)
  {
    name: 'project/react',
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // No necesario en React 17+
      'react/prop-types': 'off',         // TypeScript lo maneja
    },
  },

  // 6. Next.js plugin
  {
    name: 'project/nextjs',
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
]);
