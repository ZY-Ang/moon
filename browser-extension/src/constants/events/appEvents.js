/*
 * Copyright (c) 2018 moon
 */

// This file contains the events and request types that are EMITTED FROM THE CONTENT SCRIPT.

// --------------------- Developer ---------------------
// NOTE: Used in development for developer one-off functions. Will be useless in production
export const REQUEST_TEST_FUNCTION = "MOON_TEST_FUNCTION";
export const REQUEST_GET_ID_JWTOKEN = "MOON_GET_ID_TOKEN";

// --------------------- Launch Web Auth Flow ---------------------
/** Used to request launch of the auth flow */
export const REQUEST_LAUNCH_WEB_AUTH_FLOW = "MOON_LAUNCH_AUTH_FLOW";

/** Used to notify of sign in via email and password */
export const TYPE_STANDARD_SIGN_IN = "TypeStandardSignIn";
/** Used to notify of sign up via email and password */
export const TYPE_STANDARD_SIGN_UP = "TypeStandardSignUp";
/** Used to notify of a password reset or change */
export const TYPE_RESET_PASSWORD = "TypeResetPassword";
/** Used to notify of authentication via Facebook */
export const TYPE_FACEBOOK = "Facebook";
/** Used to notify of authentication via Google */
export const TYPE_GOOGLE = "Google";


// --------------------- Onboarding Expiry ---------------------
/** Used to skip onboarding for a week */
export const REQUEST_UPDATE_ONBOARDING_SKIP = "MOON_REQUEST_UPDATE_ONBOARDING_SKIP";

// --------------------- Launch Coinbase Auth Flow ---------------------
/** Used to launch the coinbase auth flow */
export const REQUEST_LAUNCH_COINBASE_AUTH_FLOW = "MOON_LAUNCH_COINBASE_AUTH_FLOW";

// --------------------- Coinbase Auth Flow Poll ---------------------
/** Used to poll the background script if we are in a coinbase authorization mode */
export const POLL_IS_COINBASE_AUTH_MODE = "MOON_IS_COINBASE_API_URL";

// --------------------- Update Coinbase API Key ---------------------
/** Used to notify the background of a confirmed, new API key */
export const REQUEST_UPDATE_COINBASE_API_KEYS = "MOON_UPDATE_COINBASE_API_KEYS";

// --------------------- Checkout Flow ---------------------
/** Used to request for information to be used to checkout from the page */
export const REQUEST_GET_PAYMENT_PAYLOAD = "MOON_GET_PAYMENT_PAYLOAD";

/** Used to get a single exchange rate */
export const REQUEST_GET_EXCHANGE_RATE = "MOON_GET_EXCHANGE_RATE";

/** Used to get multiple exchange rates at once */
export const REQUEST_GET_EXCHANGE_RATES = "MOON_GET_MULTI_EXCHANGE_RATES";

/** Used to notify the backend of a payment payload completion, successful or otherwise */
export const REQUEST_NOTIFY_PAYMENT_PAYLOAD_COMPLETION = "MOON_NOTIFY_PAYMENT_COMPLETION";

// --------------------- Supported Sites ---------------------
/** Used to get information about the current site by passing in {@code window.location.host} as key */
export const REQUEST_GET_SITE_INFORMATION = "MOON_GET_SITE_INFORMATION";

/** Used to request for support for the current host that the user is on */
export const REQUEST_MOON_SITE_SUPPORT = "MOON_I_WANT_TO_SHOP_ON_THIS_SITE";

/** Used to report a valid checkout page that is currently invalid on the client */
export const REQUEST_MOON_VALID_CHECKOUT_REPORT = "MOON_THIS_IS_A_CHECKOUT_PAGE";

// --------------------- Authenticated User ---------------------
export const REQUEST_UPDATE_AUTH_USER = "MOON_GET_AUTH_USER";

// --------------------- Reset Password ---------------------
export const REQUEST_RESET_PASSWORD = "MOON_RESET_PASSWORD";

// --------------------- Sign Out ---------------------
export const REQUEST_SIGN_OUT = "MOON_SIGN_OUT";

// --------------------- Global Sign Out ---------------------
export const REQUEST_GLOBAL_SIGN_OUT = "MOON_GLOBAL_SIGN_OUT";

// --------------------- Request Pop Up Screen ---------------
export const REQUEST_POPUP = "POP_UP_SCREEN";
