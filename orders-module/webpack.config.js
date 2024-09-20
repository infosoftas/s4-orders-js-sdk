const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env) => {
    const enableSourceMap = env.mode === 'development' ? true : false;

    return {
        mode: env.mode,
        target: 'web',
        entry: './src/app.tsx',
        devtool: enableSourceMap ? 'inline-source-map' : false,
        experiments: {
            outputModule: true,
        },
        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
        output: {
            filename: 'script.js',
            path: path.resolve(__dirname, 'dist'),
            publicPath: '/',
            library: {
                type: 'module',
            },
            clean: true,
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: 'css/style.css',
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
