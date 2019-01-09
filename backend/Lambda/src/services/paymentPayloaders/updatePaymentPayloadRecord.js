/*
 * Copyright (c) 2018 moon
 */

import logHead from "../../utils/logHead";
import logTail from "../../utils/logTail";
import {PAYMENT_PAYLOAD_RECORDS_TABLE} from "../../constants/paymentPayloaders/config";
import AWS from "aws-sdk";
import {removeSecrets} from "../../utils/sanitization";

/**
 * Creates or updates a transaction record in the transaction records dynamodb table
 * @param id - the unique id associated with the payment payload
 * @param transactionData - data to be written/updated to database associated with id.
 * Each top level element of transactionData will be a column in dynamo containing the value associated with that key
 * @returns {void | *}
 */
const updatePaymentPayloadRecord = async (id, transactionData) => {
    logHead("updatePaymentPayloadRecord", transactionData);

    let dynamodb = new AWS.DynamoDB.DocumentClient();

    let UpdateExpression = "set";
    let ExpressionAttributeValues = {};
    let ExpressionAttributeNames = {};

    Object.keys(removeSecrets(transactionData))
        .forEach(key => {
            ExpressionAttributeValues[`:${key}`] = transactionData[key];
            UpdateExpression += ` #${key} = :${key},`;
            ExpressionAttributeNames[`#${key}`] = key;
        });
    if (UpdateExpression[UpdateExpression.length - 1] === ',') {
        UpdateExpression = UpdateExpression.slice(0, -1);
    }

    const params = {
        TableName: PAYMENT_PAYLOAD_RECORDS_TABLE,
        Key: {id},
        UpdateExpression,
        ExpressionAttributeValues,
        ExpressionAttributeNames
    };

    let updatePaymentPayloadRecordItemOutput;
    try {
        updatePaymentPayloadRecordItemOutput = await dynamodb.update(params).promise();
    } catch (error) {
        updatePaymentPayloadRecordItemOutput = error;
    }

    logTail("updatePaymentPayloadRecordItemOutput", updatePaymentPayloadRecordItemOutput);
};

export default updatePaymentPayloadRecord;