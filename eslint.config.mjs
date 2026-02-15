import js from '@eslint/js';
import globals from 'globals';

export default [
  // 1. Global Ignore Patterns
  {
    ignores: ['node_modules/', 'build/', 'docs/'],
  },

  // 2. Base Rules & Logic (Applied to all JS files)
  {
    files: ['**/*.js', 'eslint.config.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      ...js.configs.recommended.rules,
      // Ignore unused vars/args if they start with _
      'no-unused-vars': [
        'warn',
        {
          args: 'none', // Keeps your previous preference
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-console': 'off',
      'no-var': 'warn',
      'prefer-const': 'warn',
    },
  },

  // 3. Extension Source Specifics (/src/)
  {
    files: ['src/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        Scratch: 'readonly',
      },
    },
  },

  // 4. Build Scripts Specifics (/scripts/)
  {
    files: ['scripts/**/*.js', 'eslint.config.mjs'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
