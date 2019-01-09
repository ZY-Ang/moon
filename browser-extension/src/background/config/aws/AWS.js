/*
 * Copyright (c) 2018 moon
 */

import * as AWS from "aws-sdk";

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

// Region setting should not be handled here and be set by DevOps.
AWS.config.update({region});

export default AWS;
