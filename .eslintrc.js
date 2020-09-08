module.exports = {
  extends: [
    '@hello10/eslint-config'
  ],
  rules: {
    'no-unused-vars': ['error', {argsIgnorePattern: '^_'}]
  }
};
