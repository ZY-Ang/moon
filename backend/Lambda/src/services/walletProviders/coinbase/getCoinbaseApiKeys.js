/*
 * Copyright (c) 2018 moon
 */
const logHead = require("../../../utils/logHead");
const logTail = require("../../../utils/logTail");
const AWS = require("aws-sdk");

const COINBASE_API_KEY_TABLE = `moon-${process.env.NODE_ENV}-coinbase-api-key`;

/**
 * Gets the coinbase API Keys of a particular
 * @param sub - subject identifier of an OIDC JWT
 * @returns {Promise<object>}
 */
const getCoinbaseApiKeys = async (sub) => {
    logHead("getCoinbaseApiKeys", sub);

    if (!sub || sub.constructor !== String) {
        throw new Error(`${sub} is an invalid subject identifier.`);
    }

    let dynamodb = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName: COINBASE_API_KEY_TABLE,
        Key: {sub}
    };

    const coinbaseKeyData = await dynamodb.get(params).promise();
    const coinbaseApiKeys = coinbaseKeyData.Item;

    logTail("coinbaseApiKeys", coinbaseApiKeys);
    return coinbaseApiKeys;
};

module.exports = getCoinbaseApiKeys;
