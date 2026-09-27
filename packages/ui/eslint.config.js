import { config } from '@repo/eslint-config/react-internal';

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    // Path aliases like @repo/ui/* resolve to parent dirs internally —
    // this is expected for intra-package imports within a UI library.
    rules: {
      'import/no-relative-parent-imports': 'off',
      'import/no-unresolved': 'off',
    },
  },
];
