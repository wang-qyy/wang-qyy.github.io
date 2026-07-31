import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // ── 全局忽略 ──
  {
    ignores: ['**/node_modules/**', '**/dist/**', '.codebuddy/**'],
  },

  // ── 基础规则（所有 JS/TS 文件） ──
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // ── Client：React + TypeScript ──
  {
    files: ['packages/client/**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    rules: {
      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Import 排序
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // 未使用的 import / 变量
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
    },
  },

  // ── Server：Node/Koa TypeScript ──
  {
    files: ['packages/server/**/*.ts'],
    plugins: {
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
    },
  },

  // ── Prettier：关闭与 Prettier 冲突的 ESLint 规则 ──
  prettierConfig,
);
