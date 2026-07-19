import { defineConfig } from 'oxfmt'

export default defineConfig({
  printWidth: 100,
  singleQuote: true,
  semi: false,
  ignorePatterns: [
    '.wrangler/**',
    '.claude/**',
    'node_modules/**',
    'dist/**',
    'src/assets/**',
    '**/*.md',
  ],
})
