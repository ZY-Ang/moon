/*
 * Copyright (c) 2018 moon
 */

// This file contains the events and request types that are emitted from the background script.

/** Used to notify that the injected app was triggered by manually clicking the chrome extension icon */
export const SOURCE_MANUAL = "MOON_SOURCE_MANUAL";

/** Used to notify that the injected app was triggered by non-critical events and no rendering should occur */
export const SOURCE_NONE = "MOON_SOURCE_NONE";

/** Used to request an injection of the moon extension onto the page */
export const REQUEST_INJECT_APP = "MOON_REQUEST_INJECT_APP";

/** Used to notify of an update to the current authenticated user from the background script */
export const REQUEST_UPDATE_AUTH_USER = "MOON_REQUEST_UPDATE_AUTH_USER";
