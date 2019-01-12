/*
 * Copyright (c) 2018 moon
 */

import * as AWS from "aws-sdk";
import {IDENTITY_POOL_ID as IdentityPoolId} from "./iam";

/**
 * Note: aws-sdk uses dynamic imports on a service object declaration
 * so no additional resources are used. There is no need to handle
 * dynamic imports for aws-sdk manually.
 *
 * Requiring the global namespace without services via "aws-sdk/global"
 * is now deprecated.
 *
 * @see {@link https://stackoverflow.com/questions/37263336/how-to-include-only-one-class-from-aws-sdk-in-lambda}
 */

export const region = process.env.AWS_REGION;

export let PUBLIC_CREDENTIALS = new AWS.CognitoIdentityCredentials({IdentityPoolId});

// Default configuration is set by DevOps
AWS.config.update({
    region,
    credentials: PUBLIC_CREDENTIALS
});

export default AWS;
