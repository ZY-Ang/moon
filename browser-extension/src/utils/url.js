/*
 * Copyright (c) 2018 moon
 */

import {URL_OAUTH_REDIRECT, URL_SIGN_OUT_REDIRECT} from "../constants/url";
import supportedSites from "../../supportedSites";

/**
 * @return {boolean} {@code true} if
 * {@param urlString} matches a valid URL schema
 * where the extension can run. I.e. not
 * local files or extension background pages
 */
export const isValidWebUrl = (urlString) =>
    (urlString.startsWith('http://') || urlString.startsWith('https://'));

/**
 * @return {boolean} {@code true} if
 * {@param urlString} matches a redirect URL from
 * the OAuth flow
 */
export const isOAuthUrl = (urlString) =>
    urlString.startsWith(URL_OAUTH_REDIRECT);
/**
 * @return {boolean} {@code true} if
 * {@param urlString} matches a redirect URL from
 * the OAuth sign out flow
 */
export const isClearCacheUrl = (urlString) =>
    urlString.startsWith(URL_SIGN_OUT_REDIRECT);
/**
 * @returns {boolean} {@code true} if
 * {@param urlString} matches a {@code nonCheckoutURL}
 * of a supported site.
 */
export const isSupportedSite = (urlString) => {
    const {host} = new URL(urlString);
    return supportedSites[host] && supportedSites[host].isSupported;
};

/**
 * @returns {boolean} {@code true} if
 * {@param urlString} matches a {@code regexCheckoutURL}
 * of a supported site.
 */
export const isCheckoutPage = (urlString) => {
    const {host, pathname} = new URL(urlString);
    return supportedSites[host] && pathname.startsWith(supportedSites[host].pathnameCheckout);
};
