/*
 * Copyright (c) 2018 moon
 */

import '../utils/preload.js';
import {REQUEST_LAUNCH_WEB_AUTH_FLOW, REQUEST_SIGN_OUT} from "../constants/events/app";
import {REQUEST_INJECT_APP, REQUEST_UPDATE_AUTH_USER, SOURCE_MANUAL} from "../constants/events/background";
import {doLaunchWebAuthFlow, doOnAuthFlowResponse, doSignOut, getTrimmedAuthUser} from "./auth";
import {extensionId} from "../constants/extension";
import {isCheckoutPage, isClearCacheUrl, isOAuthUrl, isSupportedSite} from "../utils/url";
import {setInvalidBrowserActionIcon, setValidBrowserActionIcon} from "./icon";
import {URL_EXTENSION_INSTALLED, URL_EXTENSION_UNINSTALLED} from "../constants/url";

/**
 * Handler for when a {@param tab} is updated.
 */
const handleTabUpdate = (tab) => {
    if (!tab || !tab.url) {
        // URL or tab does not exist yet - ignore and let the next call deal with it.
        setInvalidBrowserActionIcon();

    } else if (isOAuthUrl(tab.url)) {
        // URL on the current tab is a OAuth redirect URL - retrieve tokens from code grant and store in storage
        doOnAuthFlowResponse(tab.url, tab.id)
        // TODO: Let webapp domain manually handle closing so as to store tokens in localStorage as well, for dashboard purposes.

    } else if (isClearCacheUrl(tab.url)) {
        chrome.tabs.remove(tab.id);

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
    doUpdateAuthUserEvent();
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
    }, tabs => {
        // Send message to script file
        const message = {
            source: source,
            message: REQUEST_INJECT_APP
        };
        console.log("Sending message: ", message);
        chrome.tabs.sendMessage(tabs[0].id, message, null,
            response => console.log("response: ", response)
        );
    });

/**
 * Sends an authUser update request to the
 * content-script (app) to be rendered.
 */
const doUpdateAuthUserEvent = () =>
    chrome.storage.local.get("authUser", ({authUser}) => {
        if (!!authUser) {
            chrome.tabs.query({
                active: true,
                currentWindow: true,
            }, (tabs) => {
                // Send message to script file
                const message = {
                    message: REQUEST_UPDATE_AUTH_USER,
                    authUser: getTrimmedAuthUser(authUser)
                };
                console.log("Sending message: ", message);
                chrome.tabs.sendMessage(tabs[0].id, message, null,
                    response => console.log("response: ", response)
                );
            });
        }
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
chrome.tabs.onActivated.addListener(activeInfo =>
    chrome.tabs.get(activeInfo.tabId, (tab) => handleTabUpdate(tab))
);

/**
 * Fired when the currently focused window changes.
 * @see {@link https://developer.chrome.com/extensions/windows#event-onFocusChanged}
 */
chrome.windows.onFocusChanged.addListener(() =>
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, tabs => handleTabUpdate(tabs[0]))
);

/**
 * Fired when the background script receives a new message.
 *
 * Note: Code looks the same for both content and background scripts.
 *
 * @see {@link https://developer.chrome.com/extensions/runtime#event-onMessage}
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Always ensure message extension sender is our own
    if (sender.id !== extensionId) {
        return;
    }
    const {message, type} = request;
    switch (message) {
        case REQUEST_LAUNCH_WEB_AUTH_FLOW:
            doLaunchWebAuthFlow(type);
            break;
        case REQUEST_SIGN_OUT:
            console.log("Signing out...");
            doSignOut();
            sendResponse("Signing out...");
            break;
        default:
            console.warn("Received an unknown message.\nRequest: ", request, "\nSender: ", sender);
            break;
    }
});

/**
 * Fired when the extension is installed, updated, or when chrome is updated.
 *
 * @see {@link https://developer.chrome.com/apps/runtime#event-onInstalled}
 */
chrome.runtime.onInstalled.addListener(details => {
    console.log("chrome.runtime.onInstalled details: ", details);
    if (details.reason === 'install') {
        chrome.tabs.create({url: URL_EXTENSION_INSTALLED}, (tab) => {
            // TODO: Referral code
        });
    } else if (details.reason === 'update') {
        // Reboot all content scripts in all tabs in all windows
        const manifest = chrome.runtime.getManifest();
        const contentScripts = manifest.content_scripts[0].js;
        contentScripts.forEach(contentScript => {
            chrome.tabs.query({}, tabs => {
                tabs.forEach(tab => {
                    if (!!tab && !!tab.id) {
                        chrome.tabs.executeScript(tab.id, {file: contentScript});
                    }
                });
            });
        });
    }
});

/**
 * Set the URL to be opened when the extension is uninstalled
 *
 * @see {@link https://developer.chrome.com/extensions/runtime#method-setUninstallURL}
 */
chrome.runtime.setUninstallURL(URL_EXTENSION_UNINSTALLED);
