/*
 * Copyright (c) 2018 moon
 */
const path = require("path");
const webpack = require("webpack");
const slsw = require("serverless-webpack");
const nodeExternals = require("webpack-node-externals");

/**
 * Rules for the babel-loader for javascript modules.
 *
 * @see {@link https://github.com/babel/babel-loader}
 * and {@file ../../.babelrc} for configuration.
 */
const RULE_BABEL_LOADER = {
    test: /\.js$/,
    loader: 'babel-loader',
    include: __dirname,
    exclude: /(node_modules|bower_components)/
};

process.env = Object.assign(process.env, slsw.lib.serverless.service.provider.environment);

const lambdaConfig = {
    mode: (process.env.NODE_ENV === 'production') ? 'production' : 'development',
    target: 'node',
    entry: slsw.lib.entries,
    output: {
        libraryTarget: 'commonjs',
        path: path.join(__dirname, '.webpack'),
        filename: '[name].js'
    },
    devtool: 'source-map',
    externals: [nodeExternals()],
    optimization: {
        minimize: false
    },
    performance: {
        hints: false
    },
    plugins: [
        new webpack.EnvironmentPlugin(Object.keys(process.env))
    ],
    module: {
        rules: [
            RULE_BABEL_LOADER
        ]
    }
};

module.exports = lambdaConfig;
