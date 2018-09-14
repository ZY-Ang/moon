/*
 * Copyright (c) 2018 moon
 */

// TODO: Specify in developer docs to set AWS_ACCOUNT_ID in pre-build configuration
const ACCOUNT_ID = process.env.AWS_ACCOUNT_ID || "325751747533";
export const WEBIDENTITY_IAM_ROLE_ARN = `arn:aws:iam::${ACCOUNT_ID}:role/moon-${process.env.BUILD_ENV || 'development'}-auth0-user-role`;
