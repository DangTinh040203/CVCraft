import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import turboPlugin from 'eslint-plugin-turbo';
import tseslint from 'typescript-eslint';

/**
 * A shared ESLint configuration for the repository.
 * Framework-agnostic — no React, no Tailwind rules here.
 *
 * @type {import("eslint").Linter.Config}
 */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: { turbo: turboPlugin },
    rules: { 'turbo/no-undeclared-env-vars': 'warn' },
  },
  {
    ignores: ['dist/**', 'node_modules/**', '.next/**'],
  },
  {
    settings: {
      'import/resolver': {
        typescript: { alwaysTryTypes: true },
        node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
      },
    },
  },
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
      import: importPlugin,
    },
    rules: {
      // TypeScript
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { fixStyle: 'inline-type-imports' },
      ],

      // Import sorting
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      'import/no-unresolved': 'off',
      'import/extensions': 'off',
      'import/no-relative-parent-imports': 'error',

      // General
      semi: 'warn',
      curly: ['error', 'multi-line'],
      'no-console': 'warn',

      // Prevent importing from apps into shared packages
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/apps/**', '@/apps/**', 'apps/**'],
              message:
                'Cannot import from apps into shared packages. Only import from shared into apps.',
            },
            {
              group: ['../*', '../**/*', './*', './**/*'],
              message:
                'Relative imports are not allowed. Please use path aliases instead.',
            },
          ],
        },
      ],
    },
  },
  // Allow relative imports in eslint-config files (no path aliases available)
  {
    files: ['**/eslint-config/**/*.js', '**/eslint-config/*.js'],
    rules: {
      'no-restricted-imports': 'off',
      'import/no-relative-parent-imports': 'off',
    },
  },
];
