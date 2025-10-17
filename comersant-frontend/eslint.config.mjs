import eslint from '@eslint/js';
import perfectionist from 'eslint-plugin-perfectionist';
import tseslint from 'typescript-eslint';

const noVarsConfig = ['warn', { args: 'none',
  argsIgnorePattern: '^_',
  varsIgnorePattern: '^_',
  caughtErrorsIgnorePattern: '^_',
}];

// TODO: npm on install script to create hard links
export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    plugins: {
      perfectionist,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': noVarsConfig,
      'no-unused-vars': noVarsConfig,
      'perfectionist/sort-imports': 'error',
      'max-len': ['error', {
        code: 120,
        tabWidth: 2,
        ignoreUrls: true,
      }],
      // 'prefer-template': 'error',
      'operator-linebreak': ['error', 'after', {
        overrides: {
          '+': 'before',
        },
      }],
      // 'no-useless-concat': 'error',
      'space-infix-ops': 'error',
      'indent': ['error', 2, {'SwitchCase': 1} ],
      'comma-dangle': ['error', 'always-multiline'],
      'quotes': ['warn', 'single'],
      'semi': ['error', 'always'],
      'no-multi-spaces': 'error',
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'eol-last': ['error', 'always'],
      'no-trailing-spaces': 'error',
      'lines-between-class-members': ['error', 'always', { 'exceptAfterSingleLine': true }],
      'no-fallthrough': 'off',
    },
  },
);
