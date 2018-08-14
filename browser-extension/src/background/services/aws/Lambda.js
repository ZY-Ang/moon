/*
 * Copyright (c) 2018 moon
 */

import AWS from "../../config/aws/AWS";

/**
 * Utility class for lambda functions that
 * extends and overrides functionality of {@class AWS.Lambda}
 *
 * @class
 */
class Lambda extends AWS.Lambda {
    /**
     * Invokes a lambda function.
     *
     * @param FunctionName - name of the function, duh.
     * @param {object} payload - of the function to
     *      be sent to lambda. Will be converted into
     *      a serializable string for lambda.
     * @param {optional} [invocationType] - Just see
     *      the link for more info. Too lazy lol.
     * @param {optional} [logType] - if set to "Tail",
     *      expect a base64 encoded (4kb max) log
     *      in the "x-amz-log-result" header in the
     *      function response.
     *
     * @see {@link https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Lambda.html#invoke-property}
     * @return {Request<AWS.Lambda.InvocationResponse, AWSError>}
     */
    static invoke = (FunctionName, payload, invocationType, logType) => {
        return (new AWS.Lambda())
            .invoke({
                FunctionName,
                Payload: JSON.stringify(payload),
                InvocationType: invocationType || "RequestResponse",
                LogType: logType || "None"
            });
    };

    /**
     * Parses the response {@param payload} from
     * a Lambda invocation.
     */
    static parseInvocationPayload = (payload) => JSON.parse(payload);
}

export default Lambda;
