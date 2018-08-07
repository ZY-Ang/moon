/*
 * Copyright (c) 2018 moon
 */
import BrowserAction from './browser/BrowserAction';
import Tabs from './browser/Tabs';
import {isCheckoutPage, isClearCacheUrl, isValidWebUrl, isOAuthUrl, isSupportedSite} from "../utils/url";
import {doOnAuthFlowResponse, doUpdateAuthUserEvent} from "./auth";
import {REQUEST_INJECT_APP} from "../constants/events/background";

/**
 * Sends an app injection event message to the
 * content-script (app) to be rendered.
 *
 * @param source - one of the the source constants
 *      defined in the events constants or the URL
 *      of the current tab.
 */
export const doInjectAppEvent = (source) =>
    Tabs.sendMessageToActive(REQUEST_INJECT_APP, {source});

/**
 * Handler for when a {@param tab} is updated.
 */
export const tabDidUpdate = (tab) => {
    if (!tab || !tab.url) {
        // Tab/URL does not exist yet - ignore and let the next call deal with it.
        BrowserAction.setInvalidIcon();

    } else if (isOAuthUrl(tab.url)) {
        // URL on the current tab is a OAuth redirect URL - retrieve tokens from code grant and store in storage
        doOnAuthFlowResponse(tab.url, tab.id);
        // TODO: Let webapp domain manually handle closing so as to store tokens in localStorage as well, for dashboard purposes.

    } else if (isClearCacheUrl(tab.url)) {
        // URL on the current tab is the final redirect after an OAuth logout has been hit
        // DEPRECATED. An Ajax call via Axios replaced the need to manually open a new tab
        Tabs.remove(tab);

    } else if (!isValidWebUrl(tab.url)) {
        // URL is not of a valid web schema - e.g. chrome-extension://... or file:///...
        // We ignore and do nothing
        BrowserAction.setInvalidIcon();

    } else if (isSupportedSite(tab.url)) {
        // URL on the current tab is a supported site - set to valid browser icon.
        BrowserAction.setValidIcon(tab.id);
        if (isCheckoutPage(tab.url)) {
            // URL on the current tab is supported and is a checkout page - auto render the extension
            doInjectAppEvent(tab.url);
        }
        doUpdateAuthUserEvent();

    } else {
        // URL that is on the current tab exists and is of a valid web schema but is not a supported site
        BrowserAction.setInvalidIcon(tab.id);
        doUpdateAuthUserEvent();

    }
};
