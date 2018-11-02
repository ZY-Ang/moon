/*
 * Copyright (c) 2018 moon
 */
const logHead = require("../../../utils/logHead");
const logTail = require("../../../utils/logTail");
const AWS = require("aws-sdk");
const {USER_SECRETS_TABLE} = require("../../../constants/user/config");

const updateCoinbaseApiKeys = async (sub, coinbaseApiKeys) => {
    logHead("updateCoinbaseApiKeys", coinbaseApiKeys);

    if (!!coinbaseApiKeys) {
        if (!sub || sub.constructor !== String) {
            throw new Error(`${sub} is an invalid subject identifier.`);
        }

        let dynamodb = new AWS.DynamoDB.DocumentClient();
        const params = {
            TableName: USER_SECRETS_TABLE,
            Key: {sub},
            UpdateExpression: "set coinbaseApiKeys = :coinbaseApiKeys",
            ExpressionAttributeValues: {
                ":coinbaseApiKeys": coinbaseApiKeys
            }
        };

        const coinbaseApiKeysUpdateItemOutput = await dynamodb.update(params).promise();

        logTail("coinbaseApiKeysUpdateItemOutput", coinbaseApiKeysUpdateItemOutput);
        return coinbaseApiKeysUpdateItemOutput;
    }

    logTail("updateCoinbaseApiKeys", "skipped");
};

module.exports = updateCoinbaseApiKeys;
