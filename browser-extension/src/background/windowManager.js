/*
 * Copyright (c) 2018 moon
 */
import BrowserAction from './browser/BrowserAction';
import Tabs from './browser/Tabs';
import {
    isCheckoutPage,
    isClearCacheUrl,
    isOAuthUrl,
    isSupportedSite,
    isValidWebUrl
} from "../utils/url";
import {doOnAuthFlowResponse, doUpdateAuthUserEvent} from "./auth/index";
import {REQUEST_COINBASE_EXTRACT_API_KEYS, REQUEST_INJECT_APP} from "../constants/events/backgroundEvents";
import {handleErrors} from "../utils/errors";
import {URL_COINBASE_SETTINGS_API} from "../constants/coinbase";
import {isCoinbaseAuthFlow} from "./services/coinbase";
import {isCoinbaseSettingsApiUrl, isCoinbaseSignInUrl, isCoinbaseUrl} from "../utils/coinbase";

/**
 * Sends an app injection event message to the
 * content-script (app) to be rendered.
 *
 * @param source - one of the the source constants
 *      defined in the events constants or the URL
 *      of the current tab.
 */
export const doInjectAppEvent = (source) =>
    Tabs.sendMessageToActive(REQUEST_INJECT_APP, {source}).then(doUpdateAuthUserEvent);

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

    } else if (isClearCacheUrl(tab.url)) {
        // URL on the current tab is the final redirect after an OAuth logout has been hit
        // DEPRECATED. An Ajax call via Axios replaced the need to manually open a new tab
        Tabs.remove(tab).catch(handleErrors);

    } else if (isCoinbaseAuthFlow() && !isCoinbaseSignInUrl(tab.url)) {
        // Coinbase Auth Flow is activated but not on the sign in page
        if (isCoinbaseUrl(tab.url) && !isCoinbaseSettingsApiUrl(tab.url)) {
            // Reroute the user to the settings api page of the coinbase if not currently on it.
            Tabs.update(tab.id, {url: URL_COINBASE_SETTINGS_API}).catch(handleErrors);
        } else if (isCoinbaseSettingsApiUrl(tab.url)) {
            // Let content script handle coinbase auth flow if on tab URL
            Tabs.sendMessageToActive(REQUEST_COINBASE_EXTRACT_API_KEYS).catch(handleErrors);
        }

    } else if (!isValidWebUrl(tab.url)) {
        // URL is not of a valid web schema - e.g. chrome-extension://... or file:///...
        // We ignore and do nothing
        BrowserAction.setInvalidIcon().catch(handleErrors);

    } else if (isSupportedSite(tab.url)) {
        // URL on the current tab is a supported site - set to valid browser icon.
        BrowserAction.setValidIcon(tab.id).catch(handleErrors);
        BrowserAction.setBadgeText('1', tab.id).catch(handleErrors);
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
