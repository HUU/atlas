import { includeIgnoreFile } from '@eslint/compat';
import love from 'eslint-config-love';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      '@typescript-eslint/no-inferrable-types': [
        'error',
        {
          ignoreParameters: true,
          ignoreProperties: true,
        },
      ],

      '@typescript-eslint/no-non-null-assertion': 'off',

      '@typescript-eslint/no-unnecessary-type-parameters': 'off',

      '@typescript-eslint/no-magic-numbers': 'off',

      '@typescript-eslint/no-empty-object-type': 'off',

      '@typescript-eslint/require-await': 'off',

      '@typescript-eslint/class-methods-use-this': 'off',

      '@typescript-eslint/prefer-destructuring': 'off',

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

      '@typescript-eslint/naming-convention': ['error', ...namingConvention],
    },
  },
  {
    files: ['**/*.tsx'],
    rules: {
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
  prettierRecommended,
];
