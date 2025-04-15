import eslint from '@eslint/js';
import perfectionist from 'eslint-plugin-perfectionist';
import tseslint from 'typescript-eslint';


// TODO: npm on install script to create hard links
export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    plugins: {
      perfectionist,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
      'perfectionist/sort-imports': 'error',
    },
  },
);
