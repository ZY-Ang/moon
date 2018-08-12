/*
 * Copyright (c) 2018 moon
 */

import {TYPE_AMAZON, TYPE_FACEBOOK, TYPE_GOOGLE, TYPE_STANDARD_SIGN_IN} from "../../constants/events/app";
import {
    getURLFlowParams,
    URL_AMAZON_AUTH,
    URL_FACEBOOK_AUTH,
    URL_GOOGLE_AUTH,
    URL_STANDARD_AUTH,
    URL_TOKEN_FLOW
} from "./url";
import axios from "axios";
import {parseUrl} from "query-string";
import {handleErrors} from "../../utils/errors";
import Tabs from "../browser/Tabs";
import Windows from "../browser/Windows";
import {REQUEST_UPDATE_AUTH_USER} from "../../constants/events/background";
import AuthUser from "./AuthUser";

/**
 * Signs a user into the Moon client using the JSON Web
 * {@param tokens} (JWT)
 */
const doSignIn = (tokens) => {
    console.log("doSignIn");
    // 1. Instantiate a new AuthUser object
    return new Promise((resolve, reject) => {
            try {
                resolve(new AuthUser(tokens));
            } catch (error) {
                reject(error);
            }
        })
        // 2. Sign in the auth user and get AWS credentials for the first time
        .then(authUser => authUser.signIn())
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

    const body = getURLFlowParams(code);
    console.log(`Obtaining tokens from OAuth server via secure POST`);
    return axios.post(URL_TOKEN_FLOW, body)
        .then(({data}) => {
            console.log("Retrieved tokens");
            return doSignIn(data);
        })
        .catch(err => {
            console.error("doSignIn failed with error");
            doSignOut();
            handleErrors(err);
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
const getOAuthUrlForType = async (type) => {
    switch (type) {
        case TYPE_STANDARD_SIGN_IN:
            return URL_STANDARD_AUTH;
        case TYPE_FACEBOOK:
            return URL_FACEBOOK_AUTH;
        case TYPE_GOOGLE:
            return URL_GOOGLE_AUTH;
        case TYPE_AMAZON:
            return URL_AMAZON_AUTH;
        default:
            throw new Error(`${type} is not a recognized sign in type.`);
    }
};

/**
 * Launches the OAuth web flow based on the {@param type} of authentication method
 */
export const doLaunchWebAuthFlow = (type) => {
    console.log(`doLaunchWebAuthFlow for ${type}`);
    return getOAuthUrlForType(type)
        .then(url => Windows.openPopup(url));
};

/**
 * Signs the user out (clear cache but leave tokens as is as per Cognito's behaviour)
 */
export const doSignOut = () => {
    console.log("doSignOut");
    return AuthUser.getInstance().signOut();
};

/**
 * Signs the user out from all devices (clear cache and revoke all issued tokens)
 */
export const doGlobalSignOut = () => {
    console.log("doGlobalSignOut");
    return AuthUser.getCurrent()
        .then(authUser => authUser.globalSignOut());
};

/**
 * Sends an authUser update request to the
 * active tab in the current window to be rendered.
 */
export const doUpdateAuthUserEvent = () => {
    console.log("doUpdateAuthUserEvent");
    return AuthUser.getCurrent()
        .then(authUser => {
            if (!!authUser) {
                return Tabs.sendMessageToActive(REQUEST_UPDATE_AUTH_USER, {authUser: authUser.trim()});
            } else {
                return Tabs.sendMessageToActive(REQUEST_UPDATE_AUTH_USER, {authUser: null});
            }
        })
        .catch(err => {
            handleErrors(err);
            Tabs.sendMessageToActive(REQUEST_UPDATE_AUTH_USER, {authUser: null});
        });
};
