import eslintJs from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import { defineConfig } from 'eslint/config';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// TODO(fase 5+): subir `simple-import-sort/imports` y `simple-import-sort/exports`
// de `'warn'` a `'error'` después de un pass global con `npm run lint -- --fix`
// y revisar que ningún módulo dependa de un orden de import específico (side effects).
//
// La validación de "no `tailwind.config.*` en el repo" vive en
// `scripts/check-no-tailwind-config.mjs` y corre vía `prebuild`. ESLint no
// valida presencia de archivos.

export default defineConfig([
  // 1. Ignores globales
  {
    name: 'project/ignores',
    // `.claude/**` = skills/commands locales (no trackeados por git) — no son
    // código del proyecto y rompían `lint:strict` con cientos de errores.
    ignores: ['.next/**', 'node_modules/**', 'public/**', 'next-env.d.ts', '.claude/**'],
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
      // CRITICAL: configurar Next/Link como link component para que jsx-a11y/anchor-is-valid
      // no marque false-positives ni pase por alto los Link mal usados.
      'jsx-a11y': {
        components: {
          Link: 'a',
        },
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // No necesario en React 17+
      'react/prop-types': 'off',         // TypeScript lo maneja
      // CRITICAL: cada item de lista necesita key (evita re-renders incorrectos).
      'react/jsx-key': 'error',
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
      // CRITICAL del proyecto: prohibido `<img>` nativo, siempre `next/image`.
      // Override explícito a `error` por si la config heredada lo deja en `warn`.
      '@next/next/no-img-element': 'error',
    },
  },

  // 7. Reglas custom del proyecto — automatizan las CRITICAL de CLAUDE.md
  //    (prohibir `any`, hex en JSX, `motion` raw, datos de contacto duplicados,
  //    z-index libres, console.log en prod, promesas flotantes).
  {
    name: 'project/kataleya-rules',
    files: ['**/*.{ts,tsx}'],
    rules: {
      // CRITICAL: `any` está prohibido — usar `unknown` con narrowing.
      // Ya viene de tseslint.configs.strict; lo declaramos explícito para que sea
      // imposible bajarlo a warn por accidente al editar otra extensión.
      '@typescript-eslint/no-explicit-any': 'error',

      // Server actions: una promesa sin await/catch se silencia en runtime.
      '@typescript-eslint/no-floating-promises': 'error',

      // Promesas mal usadas (pasar async a un onClick que espera void, etc.).
      '@typescript-eslint/no-misused-promises': 'error',

      // CRITICAL: prohibido `import { motion } from 'framer-motion'` directo.
      // El proyecto usa `LazyMotion` + `m` para reducir bundle size.
      'no-restricted-imports': ['error', {
        paths: [{
          name: 'framer-motion',
          importNames: ['motion'],
          message:
            'Usá LazyMotion + m. Importá { LazyMotion, domAnimation, m } y envolvé con <LazyMotion features={domAnimation}>.',
        }],
      }],

      // CRITICAL: `console.log` no debe llegar a producción. `warn`/`error` permitidos.
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // Reglas AST agrupadas: hex en JSX, datos de contacto hardcodeados, z-index libres.
      'no-restricted-syntax': ['error',
        // CRITICAL: hex hardcodeado en `style={{ ... }}` — debe usar var(--color-*).
        {
          selector: "JSXAttribute[name.name='style'] Literal[value=/#[0-9a-fA-F]{3,8}/]",
          message:
            'Color hardcodeado en JSX `style`. Usá una CSS variable de globals.css (var(--color-*)).',
        },
        // CRITICAL: hex en clases Tailwind arbitrarias `text-[#fff]`, `bg-[#000]`, `border-[#abc]`.
        {
          selector:
            "JSXAttribute[name.name='className'] Literal[value=/(text|bg|border|ring|fill|stroke|from|to|via)-\\[#[0-9a-fA-F]/]",
          message:
            'Color hex en clase Tailwind. Usá tokens del proyecto (var(--color-*) o utilities con tokens).',
        },
        // CRITICAL: rgb()/rgba() hardcodeados como string literal en JSX.
        {
          selector: "JSXAttribute[name.name='style'] Literal[value=/rgba?\\(/]",
          message:
            'Color rgb/rgba hardcodeado. Usá var(--color-*) o color-mix(in srgb, ...).',
        },
        // CRITICAL: número del negocio fuera de `src/lib/constants.ts`.
        {
          selector: "Literal[value=/51990051041/]",
          message:
            'Número de WhatsApp hardcodeado. Importá BUSINESS.phone o BUSINESS.whatsapp de @/lib/constants.',
        },
        // CRITICAL: URL wa.me/<número> fuera de constants.
        {
          selector: "Literal[value=/wa\\.me\\/\\d/]",
          message:
            'URL de WhatsApp hardcodeada. Usá BUSINESS.whatsapp o BUSINESS.whatsappWithMessage de @/lib/constants.',
        },
        // CRITICAL: handle de Instagram hardcodeado.
        {
          selector: "Literal[value=/kataleyaflawers12/]",
          message:
            'Handle de Instagram hardcodeado. Usá BUSINESS.instagram / BUSINESS.instagramHandle de @/lib/constants.',
        },
        // CRITICAL: z-index custom no permitido. Stack del proyecto: z-50, z-[90], z-[100].
        // Acepta `z-50`, `z-[90]`, `z-[100]`. Cualquier otro `z-N` o `z-[N]` arbitrario falla.
        {
          selector:
            "JSXAttribute[name.name='className'] Literal[value=/\\bz-(?!50\\b|\\[90\\]|\\[100\\])(\\d+|\\[\\d+\\])\\b/]",
          message:
            'z-index custom no permitido. Z-stack del proyecto: Navbar z-[90], WhatsAppFloat z-50, Lightbox z-[100]. Si necesitás otro nivel, justificá y agregá un token CSS.',
        },
      ],
    },
  },

  // 7.5. Scripts node — habilitar globals de Node para los scripts del repo.
  //      `scripts/*.mjs` son utilidades de build (ej. check-no-tailwind-config),
  //      corren con Node y necesitan `process`, `console`, etc.
  {
    name: 'project/scripts',
    files: ['scripts/**/*.{js,mjs}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  // 8. simple-import-sort — orden estable de imports/exports.
  //    Arrancamos en `'warn'` para no explotar el lint con cientos de violaciones.
  //    TODO: subir a `'error'` después de un pass global con `--fix` (ver header del archivo).
  {
    name: 'project/simple-import-sort',
    files: ['**/*.{js,jsx,ts,tsx,mjs}'],
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
    },
  },

  // 9. Override para `src/lib/constants.ts` — es la fuente única de verdad
  //    de los datos de negocio. Las reglas que prohiben hardcodear el teléfono,
  //    la URL de WhatsApp y el handle de Instagram NO aplican acá.
  {
    name: 'project/constants-overrides',
    files: ['src/lib/constants.ts'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
]);
