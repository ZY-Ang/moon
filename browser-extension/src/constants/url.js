/*
 * Copyright (c) 2018 moon
 */

export const DOMAIN = "paywithmoon.com";
export const URL_LANDING_PAGE = `https://${DOMAIN}/`;
export const URL_EXTENSION_INSTALLED = `${URL_LANDING_PAGE}extension-successfully-installed`;
export const URL_EXTENSION_UNINSTALLED = `${URL_LANDING_PAGE}extension-successfully-uninstalled`;
/**
 * The URL that OAuth server should redirect to let chrome client handle OAuth
 */
export const URL_OAUTH_REDIRECT = "https://extension.auth.paywithmoon.com/oauth/";
/**
 * The final redirect URL to be supplied to the OAuth Server sign out endpoint
 */
export const URL_SIGN_OUT_REDIRECT = "https://extension.auth.paywithmoon.com/logout/";
