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
    URL_OAUTH_REDIRECT,
    URL_AMAZON_AUTH,
    URL_COGNITO_SIGN_IN,
    URL_COGNITO_SIGN_UP,
    URL_FACEBOOK_AUTH,
    URL_GOOGLE_AUTH, URL_TOKEN_FLOW, URL_SIGN_OUT
} from "./config/aws/cognito/url";
import axios from "axios";
import {parseUrl, stringify} from "query-string";
import {COGNITO_CLIENT_ID} from "./config/aws/cognito/userpool";
import {CognitoIdToken, CognitoRefreshToken, CognitoUser} from "amazon-cognito-identity-js";
import userPool from "./config/aws/cognito/userpool";

/**
 * Opens a new popup window with
 * its specified {@param url}
 */
const doOpenNewPopupWindow = (url) =>
    chrome.windows.create({
        url: url,
        focused: true,
        type: 'popup',
        height: 640,
        width: 800
    });

/**
 * Signs a user into the Moon client using the JSON Web
 * {@param tokens} (JWT)
 */
const doSignInEvent = (tokens) =>
    new Promise((resolve, reject) => {
        try {
            const {id_token, refresh_token} = tokens;
            const cognitoIdToken = new CognitoIdToken({IdToken: id_token});
            const cognitoRefreshToken = new CognitoRefreshToken({RefreshToken: refresh_token});
            const username = cognitoIdToken.payload["cognito:username"];
            const authUser = new CognitoUser({
                Username: username,
                Pool: userPool
            });

            authUser.refreshSession(cognitoRefreshToken, (err) => {
                if (err) {
                    reject(err);
                } else {
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
    console.log(`Received web auth flow response ${url}`);
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
    console.log(`Posting to ${URL_TOKEN_FLOW} with config ${JSON.stringify(config)} and body ${body}`);
    return axios.post(URL_TOKEN_FLOW, body, config)
        .then(({data}) => {
            console.log("Successfully retrieved OAuth Tokens");
            return doSignInEvent(data);
        })
        .then(() => {
            // Close tab (window)
            console.log(`Closing tab ${tabId}`);
            chrome.tabs.remove(tabId);
        })
        .catch(err => {
            console.error("Unable to sign in", err);
            console.error("Error response: ", err.response);
            chrome.tabs.remove(tabId);
        });
};

/**
 * Launches the OAuth web flow based on the {@param type} of authentication method
 */
export const doLaunchWebAuthFlow = (type) => {
    console.log(`Launching web auth flow for type ${type}`);
    switch (type) {
        case TYPE_COGNITO_SIGN_IN:
            doOpenNewPopupWindow(URL_COGNITO_SIGN_IN);
            break;
        case TYPE_COGNITO_SIGN_UP:
            doOpenNewPopupWindow(URL_COGNITO_SIGN_UP);
            break;
        case TYPE_FACEBOOK:
            doOpenNewPopupWindow(URL_FACEBOOK_AUTH);
            break;
        case TYPE_GOOGLE:
            doOpenNewPopupWindow(URL_GOOGLE_AUTH);
            break;
        case TYPE_AMAZON:
            doOpenNewPopupWindow(URL_AMAZON_AUTH);
            break;
        default:
            console.error(`${type} is not a recognized web auth flow.`);
            break;
    }
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
    console.log("Calling OAuth logout endpoint");
    return axios.get(URL_SIGN_OUT)
        .then(() => console.log(`Successfully called ${URL_SIGN_OUT}`))
        .catch(err => console.error(err.response));
};

/**
 * Signs the user out
 */
export const doSignOut = () =>
    new Promise((resolve, reject) => {
        try {
            doOAuthLogOut();
            chrome.storage.local.get("authUser", ({authUser}) => {
                if (!!authUser) {
                    chrome.storage.local.remove("authUser", () => {
                        console.log("User has been successfully signed out");
                        resolve(null);
                    });
                } else {
                    reject(new Error("User is not signed in."));
                }
            });
        } catch (err) {
            reject(err);
        }
    });
