/*
 * Copyright (c) 2018 moon
 */

import {
    TYPE_AMAZON,
    TYPE_FACEBOOK,
    TYPE_GOOGLE, TYPE_RESET_PASSWORD,
    TYPE_STANDARD_SIGN_IN,
    TYPE_STANDARD_SIGN_UP
} from "../../constants/events/appEvents";
import {
    AMAZON_AUTH_PARAMS,
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
import {handleErrors} from "../../utils/errors";
import Tabs from "../browser/Tabs";
import Windows from "../browser/Windows";
import {REQUEST_UPDATE_AUTH_USER} from "../../constants/events/backgroundEvents";
import AuthUser from "./AuthUser";
import store from "../redux/store";

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

    const authCsrfState = parseUrl(url).query.state.split("#")[0];
    const localCsrfState = store.getState().sessionState.csrfState;
    if(localCsrfState !== authCsrfState){
        return Promise.reject(new Error('Invalid CSRF state'));
    }

    const body = getURLFlowParams(code);
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
 * Returns the correct parameters for the specified
 * provider {@param type}
 */
const getOAuthParamsForType = (type) => {
    const oauthMap = {
        [TYPE_STANDARD_SIGN_IN]: STANDARD_SIGN_IN_PARAMS,
        [TYPE_STANDARD_SIGN_UP]: STANDARD_SIGN_UP_PARAMS,
        [TYPE_RESET_PASSWORD]: STANDARD_RESET_PASSWORD_PARAMS,
        [TYPE_FACEBOOK]: FACEBOOK_AUTH_PARAMS,
        [TYPE_GOOGLE]: GOOGLE_AUTH_PARAMS,
        [TYPE_AMAZON]: AMAZON_AUTH_PARAMS
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
        [TYPE_GOOGLE]: true,
        [TYPE_AMAZON]: true
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
    console.log(`doLaunchWebAuthFlow for ${type}`);
    return getOAuthUrlForType(type)
        .then(url => Windows.openPopup(url));
};

/**
 * Sends a password reset link to the user
 */
export const doPasswordReset = () => {
    console.log("doPasswordReset");
    return AuthUser.getInstance().resetPassword();
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
 * Cached trimmed authUser promise from an attempt
 * to call {@code AuthUser.trim()} for obtaining
 * trimmed responses without having to make a second
 * on-network call.
 */
let trimmedAuthUserPromise = null;

/**
 * Sends an authUser update request to the
 * active tab in the current window to be rendered.
 */
export const doUpdateAuthUserEvent = async () => {
    try {
        if (!!trimmedAuthUserPromise) {
            console.log("doUpdateAuthUserEvent on cache");
            const authUser = await trimmedAuthUserPromise;
            await Tabs.sendMessageToActive(REQUEST_UPDATE_AUTH_USER, {authUser});
        } else {
            console.log("doUpdateAuthUserEvent new call");
            trimmedAuthUserPromise = AuthUser.trim();
            await Tabs.sendMessageToActive(REQUEST_UPDATE_AUTH_USER, {authUser: (await trimmedAuthUserPromise)});
            trimmedAuthUserPromise = null;
        }
    } catch (error) {
        console.error("doUpdateAuthUserEvent exception: ", error);
        Tabs.sendMessageToActive(REQUEST_UPDATE_AUTH_USER, {authUser: null}).then(() => false);
        throw error;
    }
};
