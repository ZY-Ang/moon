/*
 * Copyright (c) 2018 moon
 */

const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

/**
 * Rules for the babel-loader for javascript modules.
 *
 * @see {@link https://github.com/babel/babel-loader}
 * and {@file ../../.babelrc} for configuration.
 */
const RULE_BABEL_LOADER = {
    test: /\.js$/,
    exclude: /(node_modules|bower_components)/,
    use: {
        loader: 'babel-loader'
    }
};

/**
 * Rules for using the file-loader for static files.
 *
 * @see {@link https://github.com/webpack-contrib/file-loader}
 */
const RULE_STATIC_FILE_LOADER = {
    test: /\.(jpe?g|gif|png|svg|woff|ttf|wav|mp3)$/,
    use: {
        loader: 'file-loader',
        options: {
            name: '[name].[md5:hash:hex:6].[ext]',
            outputPath: 'static/'
        }
    }
};

/**
 * Webpack configuration for the browser-extension.
 *
 * Note: target defaults to {@code web}.
 * @see {@link https://webpack.js.org/configuration/target/}
 *
 * @param env - for using cli environment variables.
 *  Should be redundant if using {@code process.env}
 */
const extensionConfig = env => {
    // CLI child process spawn overrides parent variables.
    process.env = Object.assign(process.env, env);
    return {
        /**
         * @see {@link https://webpack.js.org/concepts/mode/}
         */
        mode: (process.env.NODE_ENV === 'production') ? 'production' : 'development',
        /**
         * @see {@link https://webpack.js.org/configuration/devtool/}
         */
        devtool: (process.env.NODE_ENV !== 'production') && "source-map",
        /**
         * @see {@link https://webpack.js.org/configuration/plugins/}
         */
        plugins: [
            /**
             * @see {@link https://webpack.js.org/plugins/environment-plugin/} for built-in plugins
             */
            new webpack.EnvironmentPlugin(Object.keys(process.env)),
            /**
             * @see {@link https://webpack.js.org/plugins/mini-css-extract-plugin/}
             */
            new MiniCssExtractPlugin({filename: "[name].css"}),
            /**
             * @see {@link https://github.com/NMFR/optimize-css-assets-webpack-plugin}
             */
            new OptimizeCSSAssetsPlugin({
                assetNameRegExp: /\.css$/
            })
        ],
        entry: {
            app: './src/app/index.js',
            background: './src/background/index.js'
        },
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, 'build')
        },
        module: {
            rules: [
                RULE_BABEL_LOADER,
                RULE_STATIC_FILE_LOADER,
                /**
                 * @see {@link https://github.com/webpack-contrib/css-loader}
                 * @see {@link https://webpack.js.org/plugins/mini-css-extract-plugin/}
                 */
                {
                    test: /\.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        "css-loader"
                    ]
                }
            ]
        }
    };
};

/**
 * Webpack configuration for the manifest builder
 * to generate a browser manifest.json file.
 *
 * Note: target must be {@code node}.
 * @see {@link https://webpack.js.org/configuration/target/}
 */
const manifestBuilderConfig = {
    target: 'node',
    mode: 'production',
    entry: './dev/manifestBuilder.js',
    output: {
        filename: 'manifestBuilder.js',
        path: path.resolve(__dirname, 'build'),
        libraryTarget: 'commonjs2'
    },
    module: {
        rules: [
            RULE_BABEL_LOADER,
            RULE_STATIC_FILE_LOADER
        ]
    }
};

module.exports = [extensionConfig, manifestBuilderConfig];
