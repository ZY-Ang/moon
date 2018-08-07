/*
 * Copyright (c) 2018 moon
 */

import {
    TYPE_AMAZON,
    TYPE_COGNITO_SIGN_IN,
    TYPE_COGNITO_SIGN_UP,
    TYPE_FACEBOOK,
    TYPE_GOOGLE
} from "../constants/events/app";
import {
    URL_AMAZON_AUTH,
    URL_COGNITO_SIGN_IN,
    URL_COGNITO_SIGN_UP,
    URL_FACEBOOK_AUTH,
    URL_GOOGLE_AUTH,
    URL_OAUTH_REDIRECT,
    URL_SIGN_OUT,
    URL_TOKEN_FLOW
} from "./config/aws/cognito/url";
import axios from "axios";
import {parseUrl, stringify} from "query-string";
import userPool, {COGNITO_CLIENT_ID, COGNITO_USER_POOL_ID} from "./config/aws/cognito/userpool";
import {CognitoIdToken, CognitoRefreshToken, CognitoUser} from "amazon-cognito-identity-js";
import Storage from "./browser/Storage";
import {handleErrors} from "../utils/errors";
import Tabs from "./browser/Tabs";
import Windows from "./browser/Windows";
import {REQUEST_UPDATE_AUTH_USER} from "../constants/events/background";
import AWS, {REGION} from "./config/aws/AWS";
import {IDENTITY_POOL_ID} from "./config/aws/cognito/identitypool";

let authUserCache = null;

/**
 * Signs a user into the Moon client using the JSON Web
 * {@param tokens} (JWT)
 */
const doSignIn = (tokens) => {
    console.log("doSignIn");
    // Clear federated token cache
    return new Promise((resolve, reject) => {
            try {
                const {id_token} = tokens;
                const cognitoIdToken = new CognitoIdToken({IdToken: id_token});
                const username = cognitoIdToken.payload["cognito:username"];
                resolve(new CognitoUser({
                    Username: username,
                    Pool: userPool
                }));
            } catch (error) {
                reject(error);
            }
        })
        // Manually refresh session using obtained refresh token
        .then(authUser => new Promise((resolve, reject) => {
            try {
                const {refresh_token} = tokens;
                const cognitoRefreshToken = new CognitoRefreshToken({RefreshToken: refresh_token});

                authUser.refreshSession(cognitoRefreshToken, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(authUser);
                    }
                });
            } catch (error) {
                reject(error);
            }
        }))
        // Set credentials for AWS SDK
        .then(authUser => {
            // For first sign in we can be pretty sure that signInUserSession exists and is valid.
            //  For other use cases, possibly use {@code authUser.getSession} instead?
            const cognitoIdToken = authUser.getSignInUserSession().getIdToken().getJwtToken();
            AWS.config.update({
                credentials: new AWS.CognitoIdentityCredentials({
                    IdentityPoolId: IDENTITY_POOL_ID,
                    Logins: {[`cognito-idp.${REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`]: cognitoIdToken}
                })
            });
            return authUser;
        })
        // Store authUser in authUserCache as a variable for subsequent reference
        .then(authUser => new Promise((resolve, reject) => {
            authUserCache = authUser;
            if (!!authUserCache) {
                resolve(authUserCache);
            } else {
                reject(new Error("Unable to store authUser in cache"));
            }
        }))
        // Store authUser in browser storage api
        .then(authUser => Storage.local.set({authUser}))
        .then(() => console.log("User has been successfully signed in"));
};

/**
 * Function to be called when OAuth flow finalizes.
 *
 * @param {string} url - fully qualified URI of the final redirect.
 * @param {number} tabId - of the popup window
 */
export const doOnAuthFlowResponse = (url, tabId) => {
    console.log(`Obtaining tokens from OAuth server with response url: ${url}`);
    const code = parseUrl(url).query.code.split("#")[0];

    const config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    const body = stringify({
        grant_type: 'authorization_code',
        scope: 'email openid profile', // TODO: Verify scopes alignment with client and refresh call for new scopes
        redirect_uri: URL_OAUTH_REDIRECT,
        client_id: COGNITO_CLIENT_ID,
        code: code
    });
    console.log(`Obtaining tokens from OAuth server via secure POST`);
    return axios.post(URL_TOKEN_FLOW, body, config)
        .then(({data}) => {
            console.log("Retrieved tokens");
            return doSignIn(data);
        })
        .finally(() => {
            console.log(`Closing tab ${tabId}`);
            Tabs.removeById(tabId);
        });
};

/**
 * Returns a fully qualified OAuth URL for a specified
 * provider {@param type}
 */
const getOAuthUrlForType = (type) => new Promise((resolve, reject) => {
    switch (type) {
        case TYPE_COGNITO_SIGN_IN:
            resolve(URL_COGNITO_SIGN_IN);
            break;
        case TYPE_COGNITO_SIGN_UP:
            resolve(URL_COGNITO_SIGN_UP);
            break;
        case TYPE_FACEBOOK:
            resolve(URL_FACEBOOK_AUTH);
            break;
        case TYPE_GOOGLE:
            resolve(URL_GOOGLE_AUTH);
            break;
        case TYPE_AMAZON:
            resolve(URL_AMAZON_AUTH);
            break;
        default:
            reject(new Error(`${type} is not a recognized sign in type.`));
    }
});

/**
 * Launches the OAuth web flow based on the {@param type} of authentication method
 */
export const doLaunchWebAuthFlow = (type) => {
    console.log(`doLaunchWebAuthFlow for ${type}`);
    return getOAuthUrlForType(type)
        .then(url => Windows.openPopup(url));
};

/**
 * Returns a authUser object for display on the front end
 *
 * @param {CognitoUser} authUser - to be trimmed
 */
export const getTrimmedAuthUser = (authUser) => {
    // TODO: trim Cognito authUser for client interaction on front end only. (Send only data like email, name to be displayed to front end)
    return authUser;
};

/**
 * Calls the OAuth logout endpoint so cached Cognito tokens will be cleared
 * @see {@link https://docs.aws.amazon.com/cognito/latest/developerguide/logout-endpoint.html}
 */
const doOAuthLogOut = () => {
    console.log("doOAuthLogOut");
    return axios.get(URL_SIGN_OUT)
        .then(response => {
            console.log(`Cleared cache via OAuth logout endpoint with response.data: "${response.data}"`);
            return response;
        })
        .catch(handleErrors);
};

/**
 * Signs the user out (clear cache but leave tokens as is as per Cognito's behaviour)
 */
export const doSignOut = () => {
    console.log("doSignOut");
    authUserCache = null;
    return doOAuthLogOut()
        .then(() => Storage.local.get('authUser'))
        .then(({authUser}) => {
            if (!!authUser) {
                return Storage.local.remove('authUser');
            } else {
                throw new Error("User is not signed in");
            }
        });
};

/**
 * Signs the user out from all devices (clear cache and revoke all issued tokens)
 */
export const doGlobalSignOut = () => {
    console.log("doGlobalSignOut");
    return getCurrentAuthUser()
        .then(authUser => new Promise((resolve, reject) => authUser.globalSignOut({
            onSuccess: msg => resolve(msg),
            onFailure: err => reject(err)
        })))
        .then(() => {authUserCache = null})
        .then(doOAuthLogOut)
        .then(Storage.local.clear);
};

/**
 * Gets the current auth user and refreshes the session if necessary.
 */
export const getCurrentAuthUser = () => new Promise((resolve, reject) => {
    if (!!authUserCache &&
        authUserCache.getSignInUserSession() != null && // Not !== as per CognitoUser specification
        authUserCache.getSignInUserSession().isValid()
    ) {
        resolve(authUserCache);
    } else {
        Storage.local.get('authUser')
            .then(({authUser}) => {
                try {
                    if (!!authUser) {
                        const cognitoUser = new CognitoUser({
                            Username: authUser.username,
                            Pool: userPool
                        });

                        // No getters or setters as browser storage serializes as an object
                        const refreshToken = authUser.signInUserSession.refreshToken.token;
                        // Manually refresh session using refresh token
                        cognitoUser.refreshSession(new CognitoRefreshToken({RefreshToken: refreshToken}), (err) => {
                            if (err) {
                                doSignOut();
                                reject(err);
                            } else {
                                authUserCache = cognitoUser;
                                console.log("Setting CognitoUser into cache");
                                Storage.local.set({authUser: cognitoUser})
                                    .then(() => {
                                        console.log("User cache has been refreshed");
                                        resolve(cognitoUser);
                                    });
                            }
                        });
                    } else {
                        reject(new Error("You are not signed in"));
                    }
                } catch (err) {
                    doSignOut();
                    reject(err);
                }
            })
            .catch(err => {
                doSignOut();
                reject(err);
            });
    }
});

/**
 * Refreshes AWS credentials ONLY IF REQUIRED.
 *
 * This should enable all AWS SDKs that require authentication.
 */
export const refreshCredentials = () => new Promise((resolve, reject) => {
    console.log("refreshCredentials");
    // We can be sure that calling {@code AWS.config.credentials.needsRefresh()} will
    //  be in sync with the id token expiry, given that the token is supplied to the
    //  AWS config to obtain credentials.
    if (AWS.config.credentials.needsRefresh()) {
        // Getting the latest authUser refreshes tokens via the cognito identity SDK if required.
        getCurrentAuthUser()
            .then(authUser => {
                // getCurrentAuthUser automatically refreshes session so getSession is not required.
                //  For other use cases, possibly use {@code authUser.getSession()} instead?
                const cognitoIdToken = authUser.getSignInUserSession().getIdToken().getJwtToken();
                AWS.config.update({
                    credentials: new AWS.CognitoIdentityCredentials({
                        IdentityPoolId: IDENTITY_POOL_ID,
                        Logins: {[`cognito-idp.${REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`]: cognitoIdToken}
                    })
                });
                const message = "Credentials successfully refreshed. You may now make use of the AWS SDKs specified by the user's IAM role";
                console.log(message);
                resolve(message);
            })
            .catch(err => reject(err));
    } else {
        resolve("Skipping refresh");
    }
});

/**
 * Sends an authUser update request to the
 * active tab in the current window to be rendered.
 */
export const doUpdateAuthUserEvent = () => {
    console.log("doUpdateAuthUserEvent");
    return getCurrentAuthUser()
        .then(authUser => Tabs.sendMessageToActive(REQUEST_UPDATE_AUTH_USER, {
            authUser: getTrimmedAuthUser(authUser)
        }))
        .catch(() => Tabs.sendMessageToActive(REQUEST_UPDATE_AUTH_USER, {
            authUser: null
        }));
};
