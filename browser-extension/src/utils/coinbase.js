/*
 * Copyright (c) 2018 moon
 */

import {
    URL_COINBASE,
    URL_COINBASE_SETTINGS_API,
    REGEX_COIBASE_AUTHENTICATED_PAGES
} from "../constants/coinbase";

/**
 * @return {boolean} {@code true} if
 * {@param url {string}} matches a coinbase dashboard URL
 */
export const isCoinbaseUrl = (url) =>
    url.startsWith(URL_COINBASE);
/**
 * @return {boolean} {@code true} if
 * {@param url {string}} matches a coinbase sign in URL
 */
export const isCoinbaseAuthenticatedUrl = (url) => {
    try {
        const {pathname} = new URL(url);
        return REGEX_COIBASE_AUTHENTICATED_PAGES.test(pathname);
    } catch (e) {
        return false;
    }
};
/**
 * @return {boolean} {@code true} if
 * {@param url {string}} matches a coinbase api settings page
 */
export const isCoinbaseSettingsApiUrl = (url) =>
    url.startsWith(URL_COINBASE_SETTINGS_API);