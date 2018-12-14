
/*
 * Copyright (c) 2018 moon
 */

import logHead from "./logHead";
import logTail from "./logTail";
import {TRANSACTION_RECORDS_TABLE} from "../constants/user/config";
import AWS from "aws-sdk";

/**
 * Creates or updates a transaction record in the transaction records dynamodb table
 * @param transactionId - the unique id associated with the transaction
 * @param transactionData - data to be written/updated to database associated with transactionId.
 * Each top level element of transactionData will be a column in dynamo containing the value associated with that key
 * @returns {void | *}
 */
const updateTransactionRecord = async (transactionId, transactionData) => {
    logHead("updateTransactionRecord", transactionData);

    let dynamodb = new AWS.DynamoDB.DocumentClient();

    let UpdateExpression = "set";
    let ExpressionAttributeValues = {};
    let ExpressionAttributeNames = {};

    Object.keys(transactionData)
        .forEach(key => {
            ExpressionAttributeValues[`:${key}`] = transactionData[key];
            UpdateExpression += ` #${key} = :${key},`;
            ExpressionAttributeNames[`#${key}`] = key;
        });
    if (UpdateExpression[UpdateExpression.length - 1] === ',') {
        UpdateExpression = UpdateExpression.slice(0, -1);
    }

    const params = {
        TableName: TRANSACTION_RECORDS_TABLE,
        Key: {id: transactionId},
        UpdateExpression,
        ExpressionAttributeValues,
        ExpressionAttributeNames
    };

    logTail("updateTransactionRecordParams", {params});

    const updateTransactionRecordItemOutput = await dynamodb.update(params).promise();

    logTail("updateTransactionRecordItemOutput", updateTransactionRecordItemOutput);

};

export default updateTransactionRecord;