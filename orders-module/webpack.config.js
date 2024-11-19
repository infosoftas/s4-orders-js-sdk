const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const Dotenv = require('dotenv-webpack');

const envEnum = {
    qa: 'qa',
    dev: 'dev',
    prod: 'production',
};

module.exports = (env) => {
    const enableSourceMap = env.mode === 'dev' ? true : false;

    return {
        mode: env.mode,
        target: 'web',
        entry: './src/index.tsx',
        devtool: enableSourceMap ? 'inline-source-map' : false,
        experiments: {
            outputModule: true,
        },
        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
            alias: {
                Src: path.resolve(__dirname, 'src'),
                API: path.resolve(__dirname, 'src/api'),
                Component: path.resolve(__dirname, 'src/components'),
                Utils: path.resolve(__dirname, 'src/utils'),
                Hooks: path.resolve(__dirname, 'src/hooks'),
                Models: path.resolve(__dirname, 'src/models'),
                Types: path.resolve(__dirname, 'src/types'),
                Enums: path.resolve(__dirname, 'src/enums'),
                Constants: path.resolve(__dirname, 'src/constants'),
                Assets: path.resolve(__dirname, 'src/assets'),
            },
        },
        output: {
            filename: 'script.js',
            path: path.resolve(__dirname, 'lib'),
            publicPath: '/',
            library: {
                type: 'module',
            },
            clean: true,
            asyncChunks: false,
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: 'css/style.css',
            }),
            new Dotenv({
                path: `./.env.${
                    env.mode === envEnum.prod ? 'prod' : env.mode || 'prod'
                }`, // Path to .env file (this is the default)
                safe: false, // load .env.example (defaults to "false" which does not use dotenv-safe)
            }),
        ],
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                '@babel/preset-env',
                                '@babel/preset-react',
                                '@babel/preset-typescript',
                            ],
                        },
                    },
                },
                {
                    test: /\.(ts|tsx)$/,
                    exclude: /node_modules/,
                    use: ['ts-loader'],
                },
                {
                    test: /\.scss$/,
                    use: [
                        {
                            loader: 'style-loader',
                        },
                        {
                            loader: 'css-loader', // translates CSS into CommonJS
                            options: { sourceMap: enableSourceMap },
                        },
                        {
                            loader: 'sass-loader', // compiles Scss to CSS
                            options: {
                                sourceMap: enableSourceMap,
                                sassOptions: {
                                    javascriptEnabled: true,
                                },
                            },
                        },
                    ],
                },
            ],
        },
    };
};
