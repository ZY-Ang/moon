/*
 * Copyright (c) 2018 moon
 */

// This file contains the events and request types that are EMITTED FROM THE BACKGROUND SCRIPT.

// --------------------- App Injection ---------------------
/** Used to request an injection of the moon extension onto the page */
export const REQUEST_INJECT_APP = "MOON_REQUEST_INJECT_APP";

/** Used to notify that the injected app was triggered by manually clicking the chrome extension icon */
export const SOURCE_MANUAL = "MOON_SOURCE_MANUAL";
/** Used to notify that the injected app was triggered by non-critical events and no rendering should occur */
export const SOURCE_NONE = "MOON_SOURCE_NONE";

// --------------------- Tab Info Update ---------------------
/** Used to request an update of the tab information which does not exist on the content script */
export const REQUEST_UPDATE_TAB = "MOON_REQUEST_TAB_UPDATE";

// --------------------- Notify Payment Completion ---------------------
/** Used to notify a completion of the payment payload script and shut off UI blocker */
export const REQUEST_PAYMENT_COMPLETED_OFF_MODAL = "MOON_REQUEST_PAYMENT_COMPLETED_OFF_MODAL";

// --------------------- Auth User Update ---------------------
/** Used to request an update to the current authenticated user from the background script */
export const REQUEST_UPDATE_AUTH_USER = "MOON_REQUEST_UPDATE_AUTH_USER";

// --------------------- Coinbase API Keys ---------------------
/** Used to request an extraction of API keys */
export const REQUEST_COINBASE_EXTRACT_API_KEYS = "MOON_EXTRACT_COINBASE_API_KEYS";
