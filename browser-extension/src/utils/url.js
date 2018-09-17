/*
 * Copyright (c) 2018 moon
 */

import {
    URL_SIGN_OUT_REDIRECT
} from "../constants/url";
import supportedSites from "../../supportedSites";
import {URL_COINBASE, URL_COINBASE_SETTINGS_API, URL_COINBASE_SIGNIN} from "../constants/coinbase";
import {URL_OAUTH_REDIRECT} from "../constants/url";

/**
 * @return {boolean} {@code true} if
 * {@param url} matches a valid URL schema
 * where the extension can run. I.e. not
 * local files or extension background pages
 */
export const isValidWebUrl = (url) =>
    (url.startsWith('http://') || url.startsWith('https://'));

/**
 * @return {boolean} {@code true} if
 * {@param url} matches a redirect URL from
 * the OAuth flow
 */
export const isOAuthUrl = (url) =>
    url.startsWith(URL_OAUTH_REDIRECT);
/**
 * @return {boolean} {@code true} if
 * {@param url} matches a coinbase dashboard URL
 */
export const isCoinbaseUrl = (url) =>
    url.startsWith(URL_COINBASE);
/**
 * @return {boolean} {@code true} if
 * {@param url} matches a coinbase sign in URL
 */
export const isCoinbaseSignInUrl = (url) =>
    url.startsWith(URL_COINBASE_SIGNIN);
/**
 * @return {boolean} {@code true} if
 * {@param url} matches a coinbase api settings page
 */
export const isCoinbaseSettingsApiUrl = (url) =>
    url.startsWith(URL_COINBASE_SETTINGS_API);
/**
 * @return {boolean} {@code true} if
 * {@param url} matches a redirect URL from
 * the OAuth sign out flow
 */
export const isClearCacheUrl = (url) =>
    url.startsWith(URL_SIGN_OUT_REDIRECT);
/**
 * @returns {boolean} {@code true} if
 * {@param url} matches a {@code nonCheckoutURL}
 * of a supported site.
 */
export const isSupportedSite = (url) => {
    for (let i = 0; i < supportedSites.length; i++) {
        if (url.toLowerCase().search(supportedSites[i].nonCheckoutURL.toLowerCase()) > 0) return true;
    }
    return false;
};
/**
 * @returns {boolean} {@code true} if
 * {@param url} matches a {@code regexCheckoutURL}
 * of a supported site.
 */
export const isCheckoutPage = (url) => {
    for (let i = 0; i < supportedSites.length; i++) {
        if (url.toLowerCase().search(supportedSites[i].regexCheckoutURL.toLowerCase()) > 0) return true;
    }
    return false;
};
