/*
 * Copyright (c) 2018 moon
 */

import {URL_OAUTH_REDIRECT, URL_SIGN_OUT_REDIRECT} from "../background/auth/url";
import supportedSites from "../../supportedSites";

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
