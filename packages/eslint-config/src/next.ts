import pluginNext from '@next/eslint-plugin-next';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import readableTailwind from 'eslint-plugin-readable-tailwind';
import globals from 'globals';

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
 * ESLint configuration for Next.js apps.
 *
 * @type {import("eslint").Linter.Config}
 */
export const nextJsConfig = [
  ...baseConfig,
  {
    ...pluginReact.configs.flat.recommended,
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
      },
    },
  },
  {
    plugins: {
      '@next/next': pluginNext,
      'react-hooks': pluginReactHooks,
      'readable-tailwind': readableTailwind,
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs['core-web-vitals'].rules,
      ...pluginReactHooks.configs.recommended.rules,

      // React scope no longer necessary with new JSX transform
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/jsx-wrap-multilines': ['error', { prop: 'ignore' }],
      'react/state-in-constructor': ['error', 'never'],
      'react/function-component-definition': [
        'error',
        {
          namedComponents: [
            'arrow-function',
            'function-declaration',
            'function-expression',
          ],
          unnamedComponents: 'arrow-function',
        },
      ],

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
