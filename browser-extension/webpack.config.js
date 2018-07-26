/*
 * Copyright (c) 2018 moon
 */

const path = require("path");

const imageFileExtensions = ["jpg", "jpeg", "png", "gif", "svg"];

module.exports = {
    entry: {
        app: path.join(__dirname, "src", "app", "index.js"),
        background: path.join(__dirname, "src", "background", "index.js")
    },
    output: {
        path: path.join(__dirname, "build"),
        filename: "[name].js"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: new RegExp(`\.(${imageFileExtensions.join('|')})$`),
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: path.join(__dirname, "build", "[name].[hash].[ext]")
                        }
                    }
                ]
            }
        ]
    }
};
