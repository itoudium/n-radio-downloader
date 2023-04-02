module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['plugin:react/recommended', 'plugin:@typescript-eslint/recommended', 'plugin:react/jsx-runtime'],
  overrides: [],
  plugins: ['react', '@typescript-eslint'],
  rules: {
    'no-constant-condition': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
  }
}
