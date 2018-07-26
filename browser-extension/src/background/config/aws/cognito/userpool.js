/*
 * Copyright (c) 2018 moon
 */

import {CognitoUserPool} from "amazon-cognito-identity-js";

/* ------------ Cognito User Pool ID ------------ */
const COGNITO_USER_POOL_ID = 'us-east-1_yXMQEe6Uf';
// TODO: Configure staging and dev user pools

/* ------------ Cognito Client ID ------------ */
export const COGNITO_CLIENT_ID = '277g8p0hbeeieuril3mnmv0ej8';

const poolData = {
    UserPoolId : COGNITO_USER_POOL_ID,
    ClientId : COGNITO_CLIENT_ID
};
const userPool = new CognitoUserPool(poolData);
export default userPool;
