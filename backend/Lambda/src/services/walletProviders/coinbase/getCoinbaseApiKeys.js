/*
 * Copyright (c) 2018 moon
 */
const AWS = require("aws-sdk");

const COINBASE_API_KEY_TABLE = `moon-${process.env.NODE_ENV}-coinbase-api-key`;

/**
 * Gets the coinbase API Keys of a particular
 * @param sub - subject identifier of an OIDC JWT
 * @returns {Promise<object>}
 */
const getCoinbaseApiKeys = async (sub) => {
    let dynamodb = new AWS.DynamoDB.DocumentClient();
    let params = {
        TableName: COINBASE_API_KEY_TABLE,
        Key: {sub}
    };

    const coinbaseKeyData = await dynamodb.get(params).promise();
    return coinbaseKeyData.Item;
};

module.exports = getCoinbaseApiKeys;
