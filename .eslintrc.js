module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    // tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint/eslint-plugin',
    'sort-class-members',
    'typescript-sort-keys',
  ],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    'typescript-sort-keys/interface': 'error',
    'typescript-sort-keys/string-enum': 'error',
    'sort-class-members/sort-class-members': [
      2,
      {
        order: [
          // Static members
          '[private-static]',
          '[protected-static]',
          '[public-static]',

          // Instance members
          '[private-instance]',
          '[protected-instance]',
          '[public-instance]',

          // Constructor
          'constructor',

          // Getters and setters
          '[private-accessors]',
          '[protected-accessors]',
          '[public-accessors]',
        ],
        accessorPairPositioning: 'getThenSet',
        groups: {
          // Static groups
          'private-static': [{ static: true, private: true }],
          'protected-static': [{ static: true, protected: true }],
          'public-static': [{ static: true, accessorType: 'public' }],

          // Instance groups
          'private-instance': [{ static: false, private: true }],
          'protected-instance': [{ static: false, protected: true }],
          'public-instance': [{ static: false, accessorType: 'public' }],

          // Accessor groups
          'private-accessors': [
            { kind: 'get', private: true },
            { kind: 'set', private: true },
          ],
          'protected-accessors': [
            { kind: 'get', protected: true },
            { kind: 'set', protected: true },
          ],
          'public-accessors': [
            { kind: 'get', accessorType: 'public' },
            { kind: 'set', accessorType: 'public' },
          ],
        },
      },
    ],
  },
  overrides: [
    {
      files: ['*.ts'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@angular-eslint/recommended',
        'plugin:@angular-eslint/template/process-inline-templates',
      ],
      rules: {
        '@angular-eslint/directive-selector': [
          'error',
          {
            type: 'attribute',
            prefix: 'app',
            style: 'camelCase',
          },
        ],
        '@angular-eslint/component-selector': [
          'warn',
          {
            type: 'element',
            prefix: 'app',
            style: 'kebab-case',
          },
        ],
      },
    },
    {
      files: ['*.html'],
      extends: [
        'plugin:@angular-eslint/template/recommended',
        'plugin:@angular-eslint/template/accessibility',
      ],
      rules: {},
    },
    {
      files: ['scripts/**/*.js'],
      parser: 'espree',
    },
  ],
};
