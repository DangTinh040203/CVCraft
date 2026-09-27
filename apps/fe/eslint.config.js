import { nextJsConfig } from '@repo/eslint-config/next-js';

/** @type {import("eslint").Linter.Config} */
export default [
  ...nextJsConfig,
  {
    // @/* path aliases resolve to parent dirs after TS resolution — disable
    // the rule that checks resolved paths, since alias imports are the approved pattern.
    rules: {
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
            // Cross-app boundary: FE must not import from BE
            {
              group: ['**/apps/be/**', '*/be/**', '../be/**', '../../be/**'],
              message:
                'Cross-app import: FE must not import from BE. Move shared code to packages/shared.',
            },
          ],
          paths: [
            // Also block direct workspace package import
            {
              name: '@repo/be',
              message:
                'Cross-app import: FE must not import from the BE package. Move shared code to packages/shared.',
            },
          ],
        },
      ],
    },
  },
  {
    ignores: [
      '**/*.d.ts',
      'eslint.config.js',
      'postcss.config.mjs',
      '.next/**',
      'node_modules/**',
      'dist/**',
      'build/**',
      '.vercel/**',
      'coverage/**',
    ],
  },
];
