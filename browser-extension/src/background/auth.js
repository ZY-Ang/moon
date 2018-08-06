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
import userPool, {COGNITO_CLIENT_ID} from "./config/aws/cognito/userpool";
import {CognitoIdToken, CognitoRefreshToken, CognitoUser} from "amazon-cognito-identity-js";
import Storage from "./browser/Storage";
import {handleErrors} from "../utils/errors";
import Tabs from "./browser/Tabs";
import Windows from "./browser/Windows";
import {REQUEST_UPDATE_AUTH_USER} from "../constants/events/background";

let authUserCache = null;

/**
 * Signs a user into the Moon client using the JSON Web
 * {@param tokens} (JWT)
 */
const doSignIn = (tokens) => new Promise((resolve, reject) => {
    try {
        const {id_token, refresh_token} = tokens;
        const cognitoIdToken = new CognitoIdToken({IdToken: id_token});
        const cognitoRefreshToken = new CognitoRefreshToken({RefreshToken: refresh_token});
        const username = cognitoIdToken.payload["cognito:username"];
        const authUser = new CognitoUser({
            Username: username,
            Pool: userPool
        });

        // Manually refresh session using refresh token
        authUser.refreshSession(cognitoRefreshToken, (err) => {
            if (err) {
                reject(err);
            } else {
                authUserCache = authUser;
                chrome.storage.local.set({authUser: authUser}, () => {
                    console.log("User has been successfully signed in");
                    resolve(authUser);
                });
            }
        });
    } catch (err) {
        reject(err);
    }
});

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
        scope: 'email openid profile',
        redirect_uri: URL_OAUTH_REDIRECT,
        client_id: COGNITO_CLIENT_ID,
        code: code
    });
    console.log(`Posting to ${URL_TOKEN_FLOW}`);
    return axios.post(URL_TOKEN_FLOW, body, config)
        .then(({data}) => {
            console.log("Successfully retrieved OAuth Tokens");
            return doSignIn(data);
        })
        .catch(handleErrors)
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
        .then(() => console.log(`Successfully called ${URL_SIGN_OUT}`))
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
    if (!!authUserCache) {
        // Cache for authUser exists. Sign user out directly
        return new Promise((resolve, reject) => authUserCache.globalSignOut({
            onSuccess: msg => resolve(msg),
            onFailure: err => reject(err)
        }))
            .then(doOAuthLogOut)
            .then(Storage.local.clear);
    } else {
        // Cache for authUser missing. Obtain new authenticated user and revoke all.
        return getCurrentAuthUser()
            .then(authUser => new Promise((resolve, reject) => authUser.globalSignOut({
                onSuccess: msg => resolve(msg),
                onFailure: err => reject(err)
            })))
            .then(doOAuthLogOut)
            .then(Storage.local.clear);
    }
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
                                reject(err);
                            } else {
                                authUserCache = cognitoUser;
                                console.log("Setting CognitoUser", cognitoUser);
                                chrome.storage.local.set({authUser: cognitoUser}, () => {
                                    console.log("User cache has been refreshed");
                                    resolve(cognitoUser);
                                });
                            }
                        });
                    } else {
                        reject(new Error("You are not signed in"));
                    }
                } catch (err) {
                    reject(err);
                }
            })
            .catch(err => reject(err));
    }
});

/**
 * Constructs an authorization header to fit into API Gateway header?
 * TODO: Exchange tokens for IAM credentials instead and access to federated identity pool
 */
const getAuthorizationHeader = () => new Promise((resolve, reject) => {
    if (!!authUserCache &&
        authUserCache.getSignInUserSession() != null && // Not !== as per CognitoUser specification
        authUserCache.getSignInUserSession().isValid()
    ) {
        resolve(null);
    } else {
        reject(null);
    }
});

/**
 * Sends an authUser update request to the
 * active tab in the current window to be rendered.
 */
export const doUpdateAuthUserEvent = () => {
    console.log("doUpdateAuthUserEvent");
    return getCurrentAuthUser()
        .then(authUser => Tabs.sendMessageToActive({
            message: REQUEST_UPDATE_AUTH_USER,
            authUser: getTrimmedAuthUser(authUser)
        }))
        .catch(() => Tabs.sendMessageToActive({
            message: REQUEST_UPDATE_AUTH_USER,
            authUser: null
        }));
};
