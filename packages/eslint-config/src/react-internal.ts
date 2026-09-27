import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import readableTailwind from 'eslint-plugin-readable-tailwind';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import { config as baseConfig } from './base';

const tailwindCallees = [
  'clsx',
  'cva',
  'ctl',
  'twMerge',
  'cx',
  'cn',
  ['cva\\(([^)]*)\\)', '["\'`]([^"\'`]*).*?["\'`]'],
];

/**
 * ESLint configuration for internal React/UI packages (e.g. packages/ui).
 *
 * @type {import("eslint").Linter.Config}
 */
export const config = [
  ...baseConfig,
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
  {
    plugins: {
      'react-hooks': pluginReactHooks,
      'readable-tailwind': readableTailwind,
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',

      // Tailwind class readability
      'readable-tailwind/multiline': [
        'warn',
        { callees: tailwindCallees, printWidth: 80 },
      ],
      'readable-tailwind/no-unnecessary-whitespace': [
        'warn',
        { callees: tailwindCallees },
      ],
      'readable-tailwind/sort-classes': ['warn', { callees: tailwindCallees }],
      'readable-tailwind/no-duplicate-classes': [
        'error',
        { callees: tailwindCallees },
      ],
    },
  },
];
