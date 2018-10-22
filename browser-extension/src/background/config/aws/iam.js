/*
 * Copyright (c) 2018 moon
 */

const ACCOUNT_ID = process.env.AWS_ACCOUNT_ID;
export const WEBIDENTITY_IAM_ROLE_ARN = `arn:aws:iam::${ACCOUNT_ID}:role/moon-backend-${process.env.NODE_ENV}-user-role`;
