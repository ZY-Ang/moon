/*
 * Copyright (c) 2018 moon
 */
import logHead from "../../../utils/logHead";
import logTail from "../../../utils/logTail";
import AWS from "aws-sdk";
import {USER_SECRETS_TABLE} from "../../../constants/user/config";

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
        TableName: USER_SECRETS_TABLE,
        Key: {sub}
    };

    const {Item} = await dynamodb.get(params).promise();
    const coinbaseApiKeys = Item && Item.coinbaseApiKeys;

    logTail("coinbaseApiKeys", coinbaseApiKeys);
    return coinbaseApiKeys;
};

export default getCoinbaseApiKeys;
