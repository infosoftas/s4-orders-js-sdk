const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
    const isDevelopment = argv.mode !== 'production' ? true : false;
    return {
        mode: argv.mode,
        target: 'web',
        entry: './src/index.tsx',
        devtool: isDevelopment ? 'inline-source-map' : false,
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
            path: path.resolve(__dirname, 'dist'),
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
            new CopyPlugin({
                patterns: [
                    {
                        from: 'package.json',
                    },
                ],
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
                            options: { sourceMap: isDevelopment },
                        },
                        {
                            loader: 'sass-loader', // compiles Scss to CSS
                            options: {
                                sourceMap: isDevelopment,
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
