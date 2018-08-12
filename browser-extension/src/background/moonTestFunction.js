/*
 * Copyright (c) 2018 moon
 */

import AWS from "./config/aws/AWS";

/**
 * A test function to be used for prototyping new APIs.
 * This will be automatically tree-shaken out in production.
 */
const moonTestFunction = (params) => {
    console.log("moonTestFunction");
    return new Promise((resolve, reject) => {
        let lambda = new AWS.Lambda({});
        const Payload = JSON.stringify(params);
        console.log("Sending payload to Lambda: ", Payload);
        lambda.invoke({
            FunctionName : 'hello-world-federated-identity',
            InvocationType : 'RequestResponse',
            LogType : 'None',
            Payload
        }, (err, data) => {
            if (err) {
                console.log("Something went wrong in invoking the protected lambda");
                console.error(err);
                reject(err);
            } else {
                console.log("Executed Protected Lambda");
                try {
                    console.log("data: ", data);
                    const parsedPayload = JSON.parse(data.Payload);
                    console.log("parsedPayload: ", parsedPayload);
                    resolve(parsedPayload);
                } catch (error) {
                    reject(error);
                }
            }
        });
    });
};

export default moonTestFunction;
