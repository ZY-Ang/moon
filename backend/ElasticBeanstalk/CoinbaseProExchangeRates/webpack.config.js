/*
 * Copyright (c) 2018 moon
 */
const path = require("path");
const webpack = require("webpack");

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

const coinbaseProExchangeRatesConfig = env => {
    process.env = Object.assign(process.env, env);
    return {
        mode: (process.env.NODE_ENV === 'production') ? 'production' : 'development',
        target: 'node',
        devtool: (process.env.NODE_ENV !== 'production') && "source-map",
        plugins: [
            new webpack.EnvironmentPlugin(Object.keys(process.env))
        ],
        entry: './index.js',
        output: {
            libraryTarget: 'commonjs',
            filename: 'index.js',
            path: path.resolve(__dirname, 'build')
        },
        module: {
            rules: [
                RULE_BABEL_LOADER
            ]
        }
    };
};

module.exports = coinbaseProExchangeRatesConfig;
