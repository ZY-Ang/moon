/*
 * Copyright (c) 2018 moon
 */

'use strict';

const exchangeRate = require("./exchangeRate");

module.exports.hello = async (event, context) => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Go Serverless v1.0! Your function executed successfully!',
            input: event,
        }),
    };

    // Use this code if you don't use the http event with the LAMBDA-PROXY integration
    // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

module.exports.exchangeRate = exchangeRate.handler;
