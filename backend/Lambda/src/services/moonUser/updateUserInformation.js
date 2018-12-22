/*
 * Copyright (c) 2018 moon
 */
import logHead from "../../utils/logHead";
import logTail from "../../utils/logTail";
import AWS from "aws-sdk";
import {USER_INFORMATION_TABLE} from "../../constants/user/config";

const updateUserInformation = async (sub, userInformation) => {
    logHead("updateUserInformation", userInformation);

    const keyConverter = {
        referredBy: (email) => email,   // Emails are type-checked by GraphQL so we can skip for now
        onboardingSkipExpiry: (dateTime) => dateTime // DateTimes are type-checked by GraphQL so we can skip for now
    };

    const isValidUserInformation = (
        !!userInformation &&
        !!Object.keys(userInformation).filter(key => (!!keyConverter[key] && !!keyConverter[key](userInformation[key]))).length
    );

    if (isValidUserInformation) {
        if (!sub || sub.constructor !== String) {
            throw new Error(`${sub} is an invalid subject identifier.`);
        }

        let dynamodb = new AWS.DynamoDB.DocumentClient();
        let UpdateExpression = "set";
        let ExpressionAttributeValues = {};
        let ExpressionAttributeNames = {};

        Object.keys(userInformation)
            .filter(key => (!!keyConverter[key] && !!keyConverter[key](userInformation[key])))
            .forEach(key => {
                ExpressionAttributeValues[`:${key}`] = keyConverter[key](userInformation[key]);
                UpdateExpression += ` #${key} = :${key},`;
                ExpressionAttributeNames[`#${key}`] = key;
            });
        if (UpdateExpression[UpdateExpression.length - 1] === ',') {
            UpdateExpression = UpdateExpression.slice(0, -1);
        }

        const params = {
            TableName: USER_INFORMATION_TABLE,
            Key: {sub},
            UpdateExpression,
            ExpressionAttributeValues
        };

        logTail("updateUserInformationParams", {params});

        const updateUserInformationItemOutput = await dynamodb.update(params).promise();

        logTail("updateUserInformationItemOutput", updateUserInformationItemOutput);
        return updateUserInformationItemOutput;
    }

    logTail("updateUserInformation", "skipped");
};

export default updateUserInformation;
