/*
 * Copyright (c) 2018 moon
 */

import * as AWS from "aws-sdk/global";

export const REGION = process.env.REGION || 'us-east-1';

// Set the region where your identity pool exists (us-east-1, eu-west-1)
AWS.config.update({region: REGION});

export default AWS;
