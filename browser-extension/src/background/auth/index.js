/*
 * Copyright (c) 2018 moon
 */

import {
    TYPE_FACEBOOK,
    TYPE_GOOGLE,
    TYPE_RESET_PASSWORD,
    TYPE_STANDARD_SIGN_IN,
    TYPE_STANDARD_SIGN_UP
} from "../../constants/events/appEvents";
import {
    csrfState,
    FACEBOOK_AUTH_PARAMS,
    getCsrfStateAppendedParams,
    getURLFlowParams,
    GOOGLE_AUTH_PARAMS,
    STANDARD_RESET_PASSWORD_PARAMS,
    STANDARD_SIGN_IN_PARAMS,
    STANDARD_SIGN_UP_PARAMS,
    URL_OAUTH_SERVER,
    URL_TOKEN_FLOW
} from "./url";
import axios from "axios";
import {parseUrl, stringify} from "query-string";
import Tabs from "../browser/Tabs";
import Windows from "../browser/Windows";
import {REQUEST_UPDATE_IS_LOGGING_IN, REQUEST_UPDATE_AUTH_USER} from "../../constants/events/backgroundEvents";
import AuthUser from "./AuthUser";
import backgroundLogger from "../utils/BackgroundLogger";

/**
 * Signs a user into the Moon client using the JSON Web
 * {@param tokens} (JWT)
 */
const doSignIn = (tokens) => {
    backgroundLogger.log("doSignIn");
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
        .then(() => backgroundLogger.log("User has been successfully signed in"));
};

/**
 * Function to be called when OAuth flow finalizes.
 *
 * @param {string} url - fully qualified URI of the final redirect.
 * @param {number} tabId - of the popup window
 */
export const doOnAuthFlowResponse = (url, tabId) => {
    backgroundLogger.log(`Obtaining tokens from OAuth server with response url: ${url}`);
    const code = parseUrl(url).query.code.split("#")[0];

    const authCsrfState = parseUrl(url).query.state.split("#")[0];
    if(csrfState !== authCsrfState) {
        return Promise.reject(new Error(`URL CSRF state ${authCsrfState} does not match ${csrfState}`));
    }

    const body = getURLFlowParams(code);
    return Tabs.sendMessageToAll(REQUEST_UPDATE_IS_LOGGING_IN, {isLoggingIn: true})
        .then(() => axios.post(URL_TOKEN_FLOW, body))
        .then(({data}) => {
            backgroundLogger.log("Retrieved tokens");
            return doSignIn(data);
        })
        .catch(err => {
            backgroundLogger.error("doOnAuthFlowResponse exception: ", err);
            backgroundLogger.error("doOnAuthFlowResponse exception.response: ", err.response);
            doSignOut();
        })
        .finally(() => {
            Tabs.sendMessageToAll(REQUEST_UPDATE_IS_LOGGING_IN, {isLoggingIn: false});
            backgroundLogger.log(`Closing tab ${tabId}`);
            Tabs.removeById(tabId);
        });
};

/**
 * Returns the correct parameters for the specified
 * provider {@param type}
 */
const getOAuthParamsForType = (type) => {
    const oauthMap = {
        [TYPE_STANDARD_SIGN_IN]: STANDARD_SIGN_IN_PARAMS,
        [TYPE_STANDARD_SIGN_UP]: STANDARD_SIGN_UP_PARAMS,
        [TYPE_RESET_PASSWORD]: STANDARD_RESET_PASSWORD_PARAMS,
        [TYPE_FACEBOOK]: FACEBOOK_AUTH_PARAMS,
        [TYPE_GOOGLE]: GOOGLE_AUTH_PARAMS
    };
    if (oauthMap[type]) {
        return getCsrfStateAppendedParams(oauthMap[type]);
    } else {
        throw new Error(`${type} is not a recognized sign in type.`);
    }
};

/**
 * Returns a fully qualified OAuth URL for a specified
 * provider {@param type}
 */
const getOAuthUrlForType = async (type) => {
    const oauthMap = {
        [TYPE_STANDARD_SIGN_IN]: true,
        [TYPE_STANDARD_SIGN_UP]: true,
        [TYPE_RESET_PASSWORD]: true,
        [TYPE_FACEBOOK]: true,
        [TYPE_GOOGLE]: true
    };
    if (oauthMap[type]) {
        return `${URL_OAUTH_SERVER}authorize?${stringify(getOAuthParamsForType(type))}`;
    } else {
        throw new Error(`${type} is not a recognized sign in type.`);
    }
};

/**
 * Launches the OAuth web flow based on the {@param type} of authentication method
 */
export const doLaunchWebAuthFlow = (type) => {
    backgroundLogger.log(`doLaunchWebAuthFlow for ${type}`);
    return getOAuthUrlForType(type)
        .then(url => Windows.create({url, type: "popup"}));
};

/**
 * Sends a password reset link to the user
 */
export const doPasswordReset = () => {
    backgroundLogger.log("doPasswordReset");
    return AuthUser.getInstance().resetPassword();
};

/**
 * Signs the user out (clear cache but leave tokens as is as per Cognito's behaviour)
 */
export const doSignOut = () => {
    backgroundLogger.log("doSignOut");
    return AuthUser.getInstance().signOut();
};

/**
 * Signs the user out from all devices (clear cache and revoke all issued tokens)
 */
export const doGlobalSignOut = () => {
    backgroundLogger.log("doGlobalSignOut");
    return AuthUser.getCurrent()
        .then(authUser => authUser.globalSignOut());
};

/**
 * Cached trimmed authUser promise from an attempt
 * to call {@code AuthUser.trim()} for obtaining
 * trimmed responses without having to make a second
 * on-network call.
 */
let trimmedAuthUserPromise = null;

/**
 * Sends an authUser update request to the
 * active tab in the current window to be rendered.
 *
 * @param tab (optional)
 */
export const doUpdateAuthUserEvent = async (tab) => {
    try {
        if (!!trimmedAuthUserPromise) {
            const authUser = await trimmedAuthUserPromise;
            if (!!tab && !!tab.id && tab.status === "complete") {
                await Tabs.sendMessage(tab.id, REQUEST_UPDATE_AUTH_USER, {authUser});
            } else {
                await Tabs.sendMessageToActive(REQUEST_UPDATE_AUTH_USER, {authUser});
            }
        } else {
            trimmedAuthUserPromise = AuthUser.trim();
            if (!!tab && !!tab.id && tab.status === "complete") {
                await Tabs.sendMessage(tab.id, REQUEST_UPDATE_AUTH_USER, {authUser: (await trimmedAuthUserPromise)});
            } else {
                await Tabs.sendMessageToActive(REQUEST_UPDATE_AUTH_USER, {authUser: (await trimmedAuthUserPromise)});
            }
            trimmedAuthUserPromise = null;
        }
    } catch (error) {
        backgroundLogger.warn("doUpdateAuthUserEvent exception: ", error);
        Tabs.sendMessageToActive(REQUEST_UPDATE_AUTH_USER, {authUser: null}).then(() => false);
        throw error;
    }
};
