/*
 * Copyright (c) 2018 moon
 */

if (process.env.BUILD_ENV === 'production') {
    // Disable client logging on production
    console.log("Pay with moon by clicking the moon icon!");
    console.log = () => {};
    console.info = () => {};
    console.warn = () => {};
    console.error = () => {};
    // TODO: Log to Cloud Service
} else {
    console.log(`Running in ${process.env.BUILD_ENV} environment`);
}

import logo from "../../../assets/icons/logo_128.png";
import logoDisabled from "../../../assets/icons/logo_disabled_128.png";
import supportedSites from "../../supportedSites.json";
import {REQUEST_INJECT_APP, SOURCE_MANUAL} from "../constants/events";

// Set the default browser action icon to be {@code logoDisabled}
chrome.browserAction.setIcon({path: chrome.extension.getURL(logoDisabled)});

/**
 * @returns {boolean} {@code true} if
 * {@param url} matches a {@code regexCheckoutURL}
 * of a supported site.
 */
const isCheckoutPage = (url) => {
    for (let i = 0; i < supportedSites.length; i++) {
        if (url.toLowerCase().search(supportedSites[i].regexCheckoutURL.toLowerCase()) > 0) return true;
    }
    return false;
};

/**
 * @returns {boolean} {@code true} if
 * {@param url} matches a {@code nonCheckoutURL}
 * of a supported site.
 */
const isSupportedSite = (url) => {
    for (let i = 0; i < supportedSites.length; i++) {
        if (url.toLowerCase().search(supportedSites[i].nonCheckoutURL.toLowerCase()) > 0) return true;
    }
    return false;
};

/**
 * Sets the browser action icon to {@code logoDisabled}
 * for a particular {@param tabId}
 */
const setInvalidBrowserActionIcon = (tabId) =>
    chrome.browserAction.setIcon({path: chrome.extension.getURL(logoDisabled), tabId});

/**
 * Sets the browser action icon to the active {@code logo}
 * for a particular {@param tabId}
 */
const setValidBrowserActionIcon = (tabId) =>
    chrome.browserAction.setIcon({path: chrome.extension.getURL(logo), tabId});

/**
 * Handler for when a {@param tab} is updated.
 */
const handleTabUpdate = (tab) => {
    if (!tab.url) {
        // URL does not exist yet - ignore and let the next call deal with it.
        return setInvalidBrowserActionIcon();

    } else if (isSupportedSite(tab.url)) {
        // URL on the current tab is a supported site - set to valid browser icon.
        setValidBrowserActionIcon(tab.id);
        if (isCheckoutPage(tab.url)) {
            // URL on the current tab is supported and is a checkout page - auto render the extension
            doInjectAppEvent(tab.url);
        }

    } else {
        // URL that is on the current tab exists but is not valid
        setInvalidBrowserActionIcon(tab.id);
    }
};

/**
 * Sends an app injection event message to the
 * content-script (app) to be rendered.
 *
 * @param source - one of the the source constants
 *      defined in the events constants or the URL
 *      of the current tab.
 */
const doInjectAppEvent = (source) =>
    chrome.tabs.query({
        active: true,
        currentWindow: true,
    }, (tabs) => {
        // Send message to script file
        const message = {
            source: source,
            type: REQUEST_INJECT_APP
        };
        console.log("Sending message: ", message);
        chrome.tabs.sendMessage(tabs[0].id, message, null,
            response => console.log("response: ", response)
        );
    });

/**
 * Fired when a browser action icon is clicked.
 * @see {@link https://developer.chrome.com/extensions/browserAction#event-onClicked}
 */
chrome.browserAction.onClicked.addListener(() => doInjectAppEvent(SOURCE_MANUAL));

/**
 * Fired when a tab is updated.
 * @see {@link https://developer.chrome.com/extensions/tabs#event-onUpdated}
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log("onUpdated changeInfo:", changeInfo);
    if (changeInfo.status === "complete") {
        handleTabUpdate(tab);
    }
});

/**
 * Fired when the active tab is changed in a window.
 * @see {@link https://developer.chrome.com/extensions/tabs#event-onActivated}
 */
chrome.tabs.onActivated.addListener(activeInfo => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        handleTabUpdate(tab);
    });
});
