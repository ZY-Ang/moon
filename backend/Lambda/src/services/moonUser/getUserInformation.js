/*
 * Copyright (c) 2018 moon
 */
import logHead from "../../utils/logHead";
import logTail from "../../utils/logTail";
import AWS from "aws-sdk";
import {USER_INFORMATION_TABLE} from "../../constants/user/config";

/**
 * Gets the coinbase API Keys of a particular
 * @param sub - subject identifier of an OIDC JWT
 * @returns {Promise<object>}
 */
const getUserInformation = async (sub) => {
    logHead("getUserInformation", sub);

    if (!sub || sub.constructor !== String) {
        throw new Error(`${sub} is an invalid subject identifier.`);
    }

    let dynamodb = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName: USER_INFORMATION_TABLE,
        Key: {sub}
    };

    const userInformation = await dynamodb.get(params).promise().then(({Item}) => Item);

    logTail("userInformation", userInformation);
    return userInformation;
};

export default getUserInformation;
