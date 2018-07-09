/*
 * Copyright (c) 2018 moon
 */

import {CognitoUserPool} from "amazon-cognito-identity-js";

/* ------------ Cognito User Pool ID ------------ */
const COGNITO_USER_POOL_ID_PRODUCTION = 'us-east-1_m0nr8quIs';
const COGNITO_USER_POOL_ID_STAGING = 'us-east-1_wdKBNXCgT';
const COGNITO_USER_POOL_ID_DEVELOPMENT = 'us-east-1_CxIC0r5FH';
const COGNITO_USER_POOL_ID = process.env.NODE_ENV === 'production'
    ? (
        process.env.REACT_APP_DEPLOYMENT === 'production'
            ? COGNITO_USER_POOL_ID_PRODUCTION
            : COGNITO_USER_POOL_ID_STAGING
    )
    : COGNITO_USER_POOL_ID_DEVELOPMENT;

/* ------------ Cognito Client ID ------------ */
const COGNITO_CLIENT_ID_PRODUCTION = '78bnar4ukn4pdqdb7kvld485am';
const COGNITO_CLIENT_ID_STAGING = '7jaj0h33qi2mfrc25ndfcs0uk5';
const COGNITO_CLIENT_ID_DEVELOPMENT = '6vrajm919h2n2nkkpfk22o5gs9';
const COGNITO_CLIENT_ID = process.env.NODE_ENV === 'production'
    ? (
        process.env.REACT_APP_DEPLOYMENT === 'production'
            ? COGNITO_CLIENT_ID_PRODUCTION
            : COGNITO_CLIENT_ID_STAGING
    )
    : COGNITO_CLIENT_ID_DEVELOPMENT;

const poolData = {
    UserPoolId : COGNITO_USER_POOL_ID,
    ClientId : COGNITO_CLIENT_ID
};
const userPool = new CognitoUserPool(poolData);
export default userPool;
