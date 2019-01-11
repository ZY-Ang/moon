/*
 * Copyright (c) 2018 moon
 */

import {ROUTE_BROWSER_EXTENSION, ROUTE_LOGOUT, ROUTE_OAUTH_REDIRECT} from "../../../dashboard/src/components/App";

export const DOMAIN = "paywithmoon.com";
export const URL_LANDING_PAGE = `https://${DOMAIN}/`;
export const URL_DASHBOARD = process.env.NODE_ENV === 'production' ? `https://app.${DOMAIN}` : "http://localhost:3000";
export const URL_EXTENSION_INSTALLED = `${URL_LANDING_PAGE}extension-successfully-installed`;
export const URL_EXTENSION_UNINSTALLED = `${URL_LANDING_PAGE}extension-successfully-uninstalled`;
/**
 * The URL that OAuth server should redirect to let chrome client handle OAuth
 */
export const URL_OAUTH_REDIRECT = `${URL_DASHBOARD}${ROUTE_BROWSER_EXTENSION}${ROUTE_OAUTH_REDIRECT}`;
/**
 * The final redirect URL to be supplied to the OAuth Server sign out endpoint
 */
export const URL_SIGN_OUT_REDIRECT = `${URL_DASHBOARD}${ROUTE_BROWSER_EXTENSION}${ROUTE_LOGOUT}`;
/**
 * The redirect URL to be shown after updating coinbase API keys
 */
export const URL_COINBASE_POST_CONNECTION = "https://paywithmoon.com/coinbase-post-connection-message";
/**
 * The URL for tawk.to's chat widget to be thrown into an iframe's src
 */
export const URL_TAWK_TO_CHAT_IFRAME = "https://tawk.to/chat/5bf7291379ed6453ccaab1af/1ct92sc5n";
