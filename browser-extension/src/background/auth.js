/*
 * Copyright (c) 2018 moon
 */

import {
    TYPE_AMAZON,
    TYPE_COGNITO_SIGN_IN,
    TYPE_COGNITO_SIGN_UP,
    TYPE_FACEBOOK,
    TYPE_GOOGLE
} from "../constants/events/app.js";
import {
    URL_REDIRECT,
    URL_AMAZON_AUTH,
    URL_COGNITO_SIGN_IN,
    URL_COGNITO_SIGN_UP,
    URL_FACEBOOK_AUTH,
    URL_GOOGLE_AUTH, URL_TOKEN_FLOW
} from "./config/aws/cognito/url";
import axios from "axios";
import {parseUrl, stringify} from "query-string";
import {COGNITO_CLIENT_ID} from "./config/aws/cognito/userpool";

/**
 * Callback for when OAuth via {@code chrome.identity.launchWebAuthFlow} completes.
 *
 * @param {string} responseUrl - complete URI of the final redirect.
 */
const onWebAuthFlowResponse = (responseUrl) => {
    console.log(`Received web auth flow response ${responseUrl}`);
    const code = parseUrl(responseUrl).query.code;

    const config = {
        headers: {
            // Authorization: authorizationHeader,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    const body = stringify({
        grant_type: 'authorization_code',
        scope: 'email openid profile',
        redirect_uri: URL_REDIRECT,
        client_id: COGNITO_CLIENT_ID,
        code: code
    });
    axios.post(URL_TOKEN_FLOW, body, config)
        .then(({data}) => {
            console.log("Successfully retrieved OAuth Tokens: ", data);
            // TODO: Store tokens in storage and send a new message to update authUser
        })
        .catch(err => {
            console.error("Unable to retrieve tokens from Moon OAuth server", err);
        });
};

/**
 * Launches the OAuth web flow based on the {@param type} of authentication method
 * @see {@link https://developer.chrome.com/apps/identity#method-launchWebAuthFlow}
 */
export const doLaunchWebAuthFlow = (type) => {
    console.log(`Launching web auth flow for type ${type}`);
    switch (type) {
        case TYPE_COGNITO_SIGN_IN:
            chrome.identity.launchWebAuthFlow({url: URL_COGNITO_SIGN_IN}, onWebAuthFlowResponse);
            break;
        case TYPE_COGNITO_SIGN_UP:
            chrome.identity.launchWebAuthFlow({url: URL_COGNITO_SIGN_UP}, onWebAuthFlowResponse);
            break;
        case TYPE_FACEBOOK:
            chrome.identity.launchWebAuthFlow({url: URL_FACEBOOK_AUTH}, onWebAuthFlowResponse);
            break;
        case TYPE_GOOGLE:
            chrome.identity.launchWebAuthFlow({url: URL_GOOGLE_AUTH}, onWebAuthFlowResponse);
            break;
        case TYPE_AMAZON:
            chrome.identity.launchWebAuthFlow({url: URL_AMAZON_AUTH}, onWebAuthFlowResponse);
            break;
        default:
            console.error(`${type} is not a recognized web auth flow.`);
            break;
    }
};
