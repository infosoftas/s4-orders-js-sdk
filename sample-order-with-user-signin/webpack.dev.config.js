const path = require('path');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');
const ESLintPlugin = require('eslint-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env) => {
    return {
        mode: 'development',
        devtool: 'inline-source-map',
        target: 'web',
        entry: './src/index.tsx',
        output: {
            path: path.resolve(__dirname, 'dist'),
            publicPath: '/',
            filename: '[name].js',
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
        optimization: {
            splitChunks: {
                cacheGroups: {
                    default: false,
                    vendors: false,
                    // vendor chunk
                    vendor: {
                        name: 'vendor',
                        // sync + async chunks
                        chunks: 'all',
                        // import file path containing node_modules and not css
                        test: /^(?!.*\.css).*node_modules.*$/,
                    },
                },
            },
        },
        plugins: [
            new ESLintPlugin({
                extensions: [`js`, `jsx`, 'ts', 'tsx'],
                exclude: ['node_modules'],
                emitWarning: true,
            }),
            new webpack.DefinePlugin({
                'window.env': JSON.stringify(env && env.mode),
                'window.version': 1.1,
            }),
            new Dotenv({
                path: `./.env.${env.mode || 'dev'}`, // Path to .env file (this is the default)
                safe: false, // load .env.example (defaults to "false" which does not use dotenv-safe)
            }),
            new CopyPlugin({
                patterns: [{ from: 'public' }, { from: 'src/assets' }],
            }),
            // make sure we allow any jquery usages outside of our webpack modules
            new webpack.ProvidePlugin({
                moment: 'moment',
            }),
            new webpack.NoEmitOnErrorsPlugin(),
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
                    test: /\.html$/,
                    loader: 'html-loader',
                    exclude: /public\.html$/,
                    options: {
                        minimize: true,
                    },
                },
                {
                    test: /\.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: { sourceMap: true },
                        },
                    ],
                },
                {
                    test: /\.scss$/,
                    use: [
                        {
                            loader: 'style-loader',
                        },
                        {
                            loader: 'css-loader', // translates CSS into CommonJS
                            options: { sourceMap: true },
                        },
                        {
                            loader: 'sass-loader', // compiles Scss to CSS
                            options: {
                                sourceMap: true,
                                sassOptions: {
                                    javascriptEnabled: true,
                                },
                            },
                        },
                    ],
                },
                {
                    test: /\.(png|jpg|jpeg|gif)$/,
                    dependency: { not: ['url'] },
                    use: [
                        {
                            loader: 'url-loader',
                            options: {
                                name: './images/[name].[ext]',
                                limit: 10000,
                            },
                        },
                    ],
                    type: 'javascript/auto',
                },
                {
                    test: /\.(eot|ttf|woff|woff2)$/,
                    loader: 'file-loader',
                    exclude: /node_modules/,
                    options: {
                        name: './fonts/[name].[ext]',
                    },
                },
                {
                    test: /\.svg$/i,
                    issuer: /\.[jt]sx?$/,
                    use: ['@svgr/webpack', 'url-loader'],
                },
            ],
        },
        devServer: {
            historyApiFallback: true,
            static: {
                directory: path.join(__dirname, 'public'),
            },
            server: 'https',
            compress: true,
            port: 3000,
            open: true,
            client: {
                overlay: {
                    errors: true,
                    warnings: false,
                },
            },
        },
    };
};
