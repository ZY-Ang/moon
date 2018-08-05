/*
 * Copyright (c) 2018 moon
 */

import logoDisabled from "../../../assets/icons/logo_disabled_128.png";
import logo from "../../../assets/icons/logo_128.png";

/**
 * Sets the browser action icon to {@code logoDisabled}
 * for a particular {@param tabId}
 */
export const setInvalidBrowserActionIcon = (tabId) =>
    chrome.browserAction.setIcon({path: chrome.extension.getURL(logoDisabled), tabId});
/**
 * Sets the browser action icon to the active {@code logo}
 * for a particular {@param tabId}
 */
export const setValidBrowserActionIcon = (tabId) =>
    chrome.browserAction.setIcon({path: chrome.extension.getURL(logo), tabId});
