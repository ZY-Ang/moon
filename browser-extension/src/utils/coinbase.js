/*
 * Copyright (c) 2018 moon
 */

import {URL_COINBASE, URL_COINBASE_SETTINGS_API, URL_COINBASE_SIGNIN} from "../constants/coinbase";

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