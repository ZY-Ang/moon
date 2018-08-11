/*
 * Copyright (c) 2018 moon
 */
import BrowserAction from './browser/BrowserAction';
import Tabs from './browser/Tabs';
import {isCheckoutPage, isClearCacheUrl, isValidWebUrl, isOAuthUrl, isSupportedSite} from "../utils/url";
import {doOnAuthFlowResponse, doUpdateAuthUserEvent} from "./auth/index";
import {REQUEST_INJECT_APP} from "../constants/events/background";
import {handleErrors} from "../utils/errors";

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
        BrowserAction.setInvalidIcon().catch(handleErrors);

    } else if (isOAuthUrl(tab.url)) {
        // URL on the current tab is a OAuth redirect URL - retrieve tokens from code grant and store in storage
        doOnAuthFlowResponse(tab.url, tab.id).catch(handleErrors);
        // TODO: Let webapp domain manually handle closing so as to store tokens in localStorage as well, for dashboard purposes.

    } else if (isClearCacheUrl(tab.url)) {
        // URL on the current tab is the final redirect after an OAuth logout has been hit
        // DEPRECATED. An Ajax call via Axios replaced the need to manually open a new tab
        Tabs.remove(tab).catch(handleErrors);

    } else if (!isValidWebUrl(tab.url)) {
        // URL is not of a valid web schema - e.g. chrome-extension://... or file:///...
        // We ignore and do nothing
        BrowserAction.setInvalidIcon().catch(handleErrors);

    } else if (isSupportedSite(tab.url)) {
        // URL on the current tab is a supported site - set to valid browser icon.
        BrowserAction.setValidIcon(tab.id).catch(handleErrors);
        if (isCheckoutPage(tab.url)) {
            // URL on the current tab is supported and is a checkout page - auto render the extension
            doInjectAppEvent(tab.url).catch(handleErrors);
        }
        doUpdateAuthUserEvent().catch(handleErrors);

    } else {
        // URL that is on the current tab exists and is of a valid web schema but is not a supported site
        BrowserAction.setInvalidIcon(tab.id).catch(handleErrors);
        doUpdateAuthUserEvent().catch(handleErrors);

    }
};
