import js from '@eslint/js';
import parser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import importHelpers from 'eslint-plugin-import-helpers';
import prettierPlugin from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['dist/**', 'node_modules/**'],
    languageOptions: {
      parser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
      globals: {
        process: 'readonly',
        __dirname: 'readonly',
        module: 'readonly',
        require: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
      'import-helpers': importHelpers,
      prettier: prettierPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,

      // ✅ Good practices
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
      curly: 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // ❌ import/order off
      'import/order': 'off',

      // ✅ Use import-helpers (auto-fixable)
      'import-helpers/order-imports': [
        'error',
        {
          newlinesBetween: 'always',
          groups: [
            '/^react/',
            'module',
            '/^@config/',
            '/^@constants/',
            '/^@errors/',
            '/^@utils/',
            ['parent', 'sibling', 'index'],
            '/^@types/',
          ],
          alphabetize: { order: 'asc', ignoreCase: true },
        },
      ],

      'import/no-unresolved': 'off', // TS resolver handle করবে

      // ✅ Unused vars
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // ✅ Consistent type imports
      '@typescript-eslint/consistent-type-imports': 'warn',

      // ✅ Prettier integration
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          semi: true,
          trailingComma: 'all',
          printWidth: 100,
        },
      ],
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
  },

  eslintConfigPrettier,
];
