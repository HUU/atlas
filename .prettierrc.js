module.exports = {
  trailingComma: 'all',
  semi: true,
  singleQuote: true,
  quoteProps: 'consistent',
  bracketSpacing: true,
  arrowParens: 'always',
  tabWidth: 2,
  plugins: ['prettier-plugin-jsdoc', 'prettier-plugin-organize-imports'],
  overrides: [
    {
      files: ['.syncpackrc'],
      options: { parser: 'json' },
    },
  ],
};
