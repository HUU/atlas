import { includeIgnoreFile } from '@eslint/compat';
import json from '@eslint/json';
import love from 'eslint-config-love';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import atlas from './tools/custom-eslint-plugin/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, '.gitignore');

const namingConvention = [
  {
    selector: 'import',
    format: null,
  },
  {
    selector: 'default',
    format: ['camelCase'],
    leadingUnderscore: 'allow',
    trailingUnderscore: 'allow',
  },
  {
    selector: 'variable',
    format: ['camelCase', 'UPPER_CASE'],
    leadingUnderscore: 'allow',
    trailingUnderscore: 'allow',
  },
  {
    selector: 'typeLike',
    format: ['PascalCase'],
  },
  {
    selector: 'objectLiteralProperty',
    format: null,
  },
  {
    selector: 'typeParameter',
    format: ['PascalCase'],
    prefix: ['T'],
  },
  {
    selector: 'interface',
    format: ['PascalCase'],

    custom: {
      regex: '^I[A-Z]',
      match: true,
    },
  },
  {
    selector: 'enum',
    format: ['PascalCase'],

    custom: {
      regex: '^E[A-Z]',
      match: true,
    },
  },
];

export default [
  includeIgnoreFile(gitignorePath),
  {
    name: 'atlas/base',
    ...love,
    languageOptions: {
      ...love.languageOptions,
      parserOptions: {
        projectService: {
          allowDefaultProject: ['vitest.config.ts', 'drizzle.config.ts'],
          defaultProject: './tsconfig.json', // this is relative to the current project and ignores include/exclude
        },
      },
    },
    files: ['**/*.js', '**/*.ts', '**/*.tsx'],
    ignores: ['**/*.gen.ts'],
    rules: {
      ...love.rules,

      // AI struggles with default exports so just don't use them
      'import/no-default-export': 'error',

      // who cares, go for it
      '@typescript-eslint/no-magic-numbers': 'off',

      // ts-rest routes must be async but might not await anything!
      '@typescript-eslint/require-await': 'off',

      // class methods might not dereference a class property and that's fine, good OOP demands some things stay class methods
      '@typescript-eslint/class-methods-use-this': 'off',

      // this misfires all the time and gets mad at nothing like simple import/export statements
      '@typescript-eslint/prefer-destructuring': 'off',

      // regularly needed to implement overrides and overloads
      '@typescript-eslint/no-unnecessary-type-parameters': 'off',

      // the default here is straight up developer-hostile and makes JS less pleasant
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        {
          allowAny: false, // any's are evil, no
          allowNullableBoolean: true, // null != "false" makes sense
          allowNullableEnum: false, // too dangerous to crush enums with an implicit value of 0 to "false"
          allowNullableNumber: false, // same issue as allowNumber
          allowNullableObject: true, // easy null/undefined checking
          allowNullableString: true, // empty or null string ~= "false" makes sense
          allowNumber: false, // too dangerous to crush 0 to "false"
          allowString: true, // empty string ~= "false" makes sense
        },
      ],

      // sometimes you need to bind unused variables to match type definitions or access the 2nd/3rd/nth position of a dereferencing assignment
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      // C# like naming convention because I like it, too bad
      '@typescript-eslint/naming-convention': ['error', ...namingConvention],
    },
  },
  {
    name: 'atlas/tsx',
    files: ['**/*.tsx'],
    rules: {
      // Expo Router / React Navigation / TanStack Router all rely on default exports
      // ...also it's sort of a convention for react components
      'import/no-default-export': 'off',

      '@typescript-eslint/naming-convention': [
        'error',
        ...namingConvention,
        {
          // allow react components to follow PascalCase naming since that's the industry standard
          selector: [
            'variable',
            'function',
            'objectLiteralProperty',
            'objectLiteralMethod',
          ],
          types: ['function'],
          format: ['PascalCase', 'camelCase'],
        },
        {
          // special named export required by TanStack router
          selector: 'variable',
          format: null,
          filter: {
            regex: '(Route)',
            match: true,
          },
        },
      ],
    },
  },
  {
    name: 'atlas/config-files',
    files: ['**/*.config.{js,mjs,ts}', 'vitest.*.ts'],
    rules: {
      // a lot of config files use default exports
      'import/no-default-export': 'off',
    },
  },
  {
    name: 'atlas/tests',
    files: [
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/__tests__/**/*.ts',
      '**/__tests__/**/*.tsx',
      '**/__mocks__/**/*.ts',
    ],
    rules: {
      // it's a test, idgaf
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-type-assertion': 'off',
      'max-nested-callbacks': 'off',
      'no-console': 'off',
    },
  },
  {
    name: 'atlas/json',
    files: ['**/package.json'],
    language: 'json/json',
    plugins: {
      json,
      atlas,
    },
    rules: {
      'atlas/only-jit-packages': [
        'error',
        {
          buildOutputDirectories: ['./build/**'],
        },
      ],
    },
  },
  prettierRecommended,
];
