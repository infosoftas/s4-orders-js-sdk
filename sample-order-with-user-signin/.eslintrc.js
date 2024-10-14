module.exports = {
    root: true,
    env: {
        browser: true,
        es2021: true,
        es6: true,
        node: true,
        jest: true,
        jquery: true,
    },
    extends: [
        'eslint:recommended',
        'airbnb',
        'plugin:import/recommended',
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        es6: true,
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
        warnOnUnsupportedTypeScriptVersion: false,
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
    },
    plugins: ['import', 'react', '@typescript-eslint', 'react-hooks'],
    ignorePatterns: ['node_modules/'],
    rules: {
        'prettier/prettier': 'off',
        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': 'warn',
        'react/display-name': 'off',
        'react/jsx-filename-extension': [
            'warn',
            {
                extensions: ['.tsx', 'ts'],
            },
        ],
        'import/no-extraneous-dependencies': [
            'error',
            {
                devDependencies: true,
            },
        ],
        'import/extensions': [
            'error',
            'ignorePackages',
            {
                ts: 'never',
                tsx: 'never',
            },
        ],
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': 'warn',
        '@typescript-eslint/explicit-function-return-type': 'off',
        'max-len': [
            'warn',
            {
                code: 150,
            },
        ],
        'react-hooks/rules-of-hooks': 'warn',
        'react-hooks/exhaustive-deps': 'warn',
        'import/prefer-default-export': 'off',
        'react/prop-types': 'off',
        'react/require-default-props': 'off',
        'react/react-in-jsx-scope': 'off',
        'react/function-component-definition': [
            'off',
            {
                namedComponents: 'function-expression',
                unnamedComponents: 'function-expression',
            },
        ],
        'react/jsx-props-no-spreading': 'off',
        'react/state-in-constructor': 'off',
        'react/destructuring-assignment': 'off',
        'react/button-has-type': [
            'off',
            {
                button: true,
                submit: true,
                reset: true,
            },
        ],
        'no-restricted-syntax': 'off',
        'no-continue': 'off',
        'no-console': 0,
        'react/jsx-no-bind': [
            'error',
            {
                allowArrowFunctions: true,
                allowFunctions: true,
            },
        ],
        'no-param-reassign': 'off',
        'prefer-object-spread': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/restrict-template-expressions': 'warn',
        '@typescript-eslint/no-unsafe-return': ['warn'],
        '@typescript-eslint/no-unsafe-member-access': ['warn'],
        '@typescript-eslint/no-unsafe-assignment': ['warn'],
        '@typescript-eslint/no-unsafe-call': ['warn'],
        '@typescript-eslint/no-floating-promises': 'warn',
        '@typescript-eslint/no-misused-promises': 'off',
    },
    settings: {
        'import/ignore': ['.less$', '.scss$'],
        'import/resolver': {
            typescript: {
                extensions: ['.tsx', '.ts', '.js', '.jsx', '.json'],
                moduleDirectory: ['src', 'node_modules'],
            },
            node: {
                extensions: ['.tsx', '.ts', '.js', '.jsx', '.json'],
            },
        },
        // "import/core-modules": ["@mui/icons-material"],
        react: {
            version: 'detect',
        },
    },
};
