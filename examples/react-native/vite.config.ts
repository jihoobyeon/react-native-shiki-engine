import { fmt, lint } from '@rari/lint/vite'
import { defineConfig } from 'vite-plus'

export default defineConfig({
  fmt,
  lint: {
    ...lint,
    ignorePatterns: [
      ...(lint.ignorePatterns ?? []),
      '**/Pods/',
      '**/build/',
      '**/.gradle',
      '**/.cxx/',
      '**/.kotlin/',
    ],
    rules: {
      ...lint.rules,
      'typescript/prefer-readonly-parameter-types': 'off',
    },
  },
})
