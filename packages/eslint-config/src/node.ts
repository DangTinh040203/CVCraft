import immerPlugin from 'eslint-plugin-immer';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import { config as baseConfig } from './base';

/**
 * ESLint configuration for Node.js / NestJS backends.
 * Extends base with type-aware rules and backend-specific patterns.
 *
 * IMPORTANT: consuming apps must add parserOptions to their eslint.config.js:
 *   languageOptions: {
 *     parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname }
 *   }
 *
 * @type {import("eslint").Linter.Config}
 */
export const nodeConfig = [
  ...baseConfig,
  // Type-aware TypeScript rules (requires parserOptions.projectService in app config)
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
    },
    plugins: {
      immer: immerPlugin,
    },
    rules: {
      // Type-aware TS rules from rag-cv-builder
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-misused-promises': [
        'warn',
        { checksVoidReturn: { attributes: false } },
      ],
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-empty-interface': 'warn',

      // Relax unsafe rules — NestJS decorators generate patterns that trigger these
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',

      // Immer — allow draft mutation, block map anti-patterns
      'immer/no-update-map': 'error',
      'no-param-reassign': [
        'error',
        {
          props: true,
          ignorePropertyModificationsForRegex: ['^draft', 'state'],
        },
      ],

      // Console is useful in server logs — allow warn/error
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // Import sort as warn (not error) for BE — less strict than FE
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
    },
  },
];
