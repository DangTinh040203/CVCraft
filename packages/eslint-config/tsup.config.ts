import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    base: 'src/base.ts',
    next: 'src/next.ts',
    'react-internal': 'src/react-internal.ts',
    node: 'src/node.ts',
  },
  format: ['esm'],
  dts: false,
  clean: true,
  external: [
    '@eslint/js',
    'eslint-config-prettier',
    'eslint-plugin-import',
    'eslint-plugin-immer',
    'eslint-plugin-prettier',
    'eslint-plugin-readable-tailwind',
    'eslint-plugin-react',
    'eslint-plugin-react-hooks',
    'eslint-plugin-simple-import-sort',
    'eslint-plugin-turbo',
    '@next/eslint-plugin-next',
    'globals',
    'typescript-eslint',
  ],
});
