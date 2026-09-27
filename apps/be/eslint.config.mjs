import { nodeConfig } from '@repo/eslint-config/node';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import("eslint").Linter.Config} */
export default [
  ...nodeConfig,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // @/* alias resolves to parent dirs after TS resolution — path aliases are the approved pattern
      'import/no-relative-parent-imports': 'off',
    },
  },
  {
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            // Inherited from base: no relative imports
            {
              group: ['../*', '../**/*', './*', './**/*'],
              message:
                'Relative imports are not allowed. Use path aliases instead.',
            },
            // Inherited from base: no importing apps into shared packages
            {
              group: ['**/apps/**', '@/apps/**', 'apps/**'],
              message:
                'Cannot import from apps into shared packages. Only import from shared into apps.',
            },
            // Cross-app boundary: BE must not import from FE
            {
              group: ['**/apps/fe/**', '*/fe/**', '../fe/**', '../../fe/**'],
              message:
                'Cross-app import: BE must not import from FE. Move shared code to packages/shared.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.spec.ts', '**/__tests__/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
];
