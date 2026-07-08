import { globalIgnores } from 'eslint/config'
import js from '@eslint/js'

export default [
  globalIgnores(['dist', '**/components/ui/**']),
  {
    ...js.configs.recommended,
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': 'warn',
      'no-console': 'off',
    },
  },
]
