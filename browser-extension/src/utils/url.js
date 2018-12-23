/*
 * Copyright (c) 2018 moon
 */

import {URL_OAUTH_REDIRECT, URL_SIGN_OUT_REDIRECT} from "../constants/url";
import supportedSites from "../../../backend/Lambda/supportedSites";
import {
    ROUTE_AMAZON_CHECKOUT_DEFAULT,
    ROUTE_AMAZON_CHECKOUT_MUSIC
} from "../app/components/main/screens/www.amazon.com/constants/routes";

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
 *
 * If {@param pathnameCheckout} is supplied, it will override
 * {@code supportedSites[host].pathnameCheckout}.
 */
export const isCheckoutPage = (urlString, pathnameCheckout) => {
    const {pathname} = new URL(urlString);
    if (!!pathnameCheckout) {
        return (
            isSupportedSite(urlString) &&
            !!pathnameCheckout &&
            !!pathnameCheckout.length &&
            pathnameCheckout.reduce((prev, curPathname) => (pathname.startsWith(curPathname) || prev), false)
        );
    } else {
        return (
            isSupportedSite(urlString) &&
            [
                ROUTE_AMAZON_CHECKOUT_DEFAULT,
                ROUTE_AMAZON_CHECKOUT_MUSIC
            ].reduce((prev, curPathname) => (!!pathname.match(curPathname) || prev), false)
        );
    }
};
