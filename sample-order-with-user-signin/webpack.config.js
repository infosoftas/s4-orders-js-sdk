const path = require('path');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');
const ESLintPlugin = require('eslint-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');

const envEnum = {
    qa: 'qa',
    dev: 'dev',
    prod: 'production',
};

module.exports = (env) => {
    const enableSourceMap = env.mode === 'dev' ? true : false;

    return {
        mode: 'production',
        target: 'web',
        entry: './src/index.tsx',
        output: {
            path: path.join(__dirname, 'dist'),
            publicPath: '/',
            filename: 'js/[name].bundle.[hash].js',
            chunkFilename: 'js/[name].bundle.[hash].js',
        },
        devtool: enableSourceMap ? 'inline-source-map' : false,
        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
            alias: {
                Src: path.resolve(__dirname, 'src'),
                API: path.resolve(__dirname, 'src/api'),
                Component: path.resolve(__dirname, 'src/components'),
                Context: path.resolve(__dirname, 'src/context'),
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
            minimizer: [
                new TerserPlugin({
                    exclude: /\/node_modules/,
                    terserOptions: {
                        sourceMap: enableSourceMap, //Enabeling SourceMap for SourceMapDevToolPlugin
                        output: {
                            comments: false,
                        },
                    },
                }),
            ],
            splitChunks: {
                cacheGroups: {
                    default: false,
                    vendors: false,
                    // vendor chunk
                    vendor: {
                        minSize: 0,
                        maxSize: 1200000,
                        name: 'vendor',
                        // sync + async chunks
                        chunks: 'all',
                        // import file path containing node_modules
                        test: /^(?!.*\.css).*node_modules.*$/,
                    },
                },
            },
        },
        plugins: [
            new ESLintPlugin({
                extensions: [`js`, `jsx`, 'ts', 'tsx'],
                exclude: ['node_modules'],
            }),
            new MiniCssExtractPlugin({
                filename: 'css/[name].[hash].css',
                chunkFilename: 'css/[id].[hash].css',
            }),
            new webpack.DefinePlugin({
                'window.env': JSON.stringify(env && env.mode),
                'window.version': 1.1,
            }),
            new Dotenv({
                path: `./.env.${
                    env.mode === envEnum.prod ? 'prod' : env.mode || 'prod'
                }`, // Path to .env file (this is the default)
                safe: false, // load .env.example (defaults to "false" which does not use dotenv-safe)
            }),
            new CopyPlugin({
                patterns: [
                    { from: 'src/assets' },
                    {
                        from: 'public',
                        globOptions: {
                            ignore: ['**/index.html'],
                        },
                    },
                ],
            }),
            // make sure we allow any jquery usages outside of our webpack modules
            new webpack.ProvidePlugin({
                moment: 'moment',
            }),
            new webpack.NoEmitOnErrorsPlugin(),
            //Generate an external css file
            new HtmlWebPackPlugin({
                template: path.resolve(__dirname, './public/index-prod.html'),
                filename: 'index.html',
                inject: 'body',
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
                    // exclude: /node_modules/,
                    use: {
                        loader: 'ts-loader',
                        options: {
                            allowTsInNodeModules: true,
                        },
                    },
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
                {
                    test: /\.(png|jpg|jpeg|gif)$/,
                    dependency: { not: ['url'] },
                    use: [
                        {
                            loader: 'url-loader',
                            options: {
                                name: './imges/[name].[ext]',
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
    };
};
