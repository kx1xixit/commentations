import js from '@eslint/js';
import globals from 'globals';
import requireScratchTranslate from './scripts/eslint-rules/require-scratch-translate.js';

const scratchPlugin = {
  rules: {
    'require-scratch-translate': requireScratchTranslate,
  },
};

export default [
  {
    ignores: ['node_modules/', 'build/', 'docs/'],
  },
  {
    files: ['**/*.js', 'eslint.config.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': [
        'warn',
        {
          // This covers normal variables (like _e)
          varsIgnorePattern: '^_',
          // This covers function arguments (like _args)
          argsIgnorePattern: '^_',
          // This covers try/catch errors (like catch (_e))
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-console': 'off',
      'no-var': 'warn',
      'prefer-const': 'warn',
    },
  },
  {
    files: ['src/**/*.js'],
    plugins: {
      scratch: scratchPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        Scratch: 'readonly',
      },
    },
    rules: {
      'scratch/require-scratch-translate': 'error',
    },
  },
  {
    files: ['scripts/**/*.js', 'eslint.config.mjs'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
