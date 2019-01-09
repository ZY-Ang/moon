/*
 * Copyright (c) 2018 moon
 */
import BrowserAction from './browser/BrowserAction';
import Tabs from './browser/Tabs';
import AuthUser from "./auth/AuthUser";
import {
    isCheckoutPage,
    isClearCacheUrl,
    isOAuthUrl,
    isSupportedSite,
    isValidWebUrl
} from "../utils/url";
import {doOnAuthFlowResponse, doUpdateAuthUserEvent} from "./auth/index";
import {
    REQUEST_COINBASE_EXTRACT_API_KEYS,
    REQUEST_INJECT_APP,
    REQUEST_UPDATE_TAB
} from "../constants/events/backgroundEvents";
import {handleErrors} from "../utils/errors";
import {URL_COINBASE_SETTINGS_API} from "../constants/coinbase";
import {isCoinbaseAuthFlow} from "./services/coinbase";
import {isCoinbaseSettingsApiUrl, isCoinbaseAuthenticatedUrl, isCoinbaseUrl} from "../utils/coinbase";
import {isSuccessfullyInstalledPage} from "../utils/moon";
import BackgroundRuntime from "./browser/BackgroundRuntime";
import {MESSAGE_ERROR_ENDS_WITH_NO_RECEIVER} from "./browser/constants";

/**
 * Sends a tab update event to the content script
 * to notify of SPA changes undetectable by standard
 * Javascript APIs
 *
 * @param tab - Extension API tab object
 */
export const doUpdateTabEvent = async (tab) => {
    try {
        if (!tab) {
            const activeTab = await Tabs.getActive();
            if (!!activeTab) {
                return doUpdateTabEvent(activeTab);
            }
        }
        await Tabs.sendMessage(tab.id, REQUEST_UPDATE_TAB, {tab});
    } catch (err) {
        if (!!err.message && err.message.includes(MESSAGE_ERROR_ENDS_WITH_NO_RECEIVER)) {
            return doInjectAppEvent(tab.url, tab);
        } else {
            console.error("doUpdateTabEvent failed with uncaught exception: ", err);
        }
    }
};

/**
 * Sends an app injection event message to the
 * content-script (app) to be rendered.
 *
 * @param source - one of the the source constants
 *      defined in the events constants or the URL
 *      of the current tab.
 * @param tab - Extension API tab object
 */
export const doInjectAppEvent = async (source, tab) => {
    try {
        if (!tab) {
            const activeTab = await Tabs.getActive();
            if (!!activeTab) {
                return doInjectAppEvent(source, activeTab);
            }
        }
        const authUser = await AuthUser.getCurrent().then(authUser => authUser.trim()).catch(() => null);
        return Tabs.sendMessage(tab.id, REQUEST_INJECT_APP, {authUser, source, tab});
    } catch (err) {
        if (!!err.message && err.message.includes(MESSAGE_ERROR_ENDS_WITH_NO_RECEIVER)) {
            const manifest = BackgroundRuntime.getManifest();
            const contentScripts = manifest.content_scripts[0].js;
            await Promise.all(contentScripts.map(file =>
                Tabs.executeScript(tab.id, {file})
                    .catch(() => console.warn(`Skipping ${tab.id} with ${tab.url}`))
            ));
            return doInjectAppEvent(source, tab);
        } else {
            console.error("doInjectAppEvent failed with uncaught exception: ", err);
        }
    }
};

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

    } else if (isSuccessfullyInstalledPage(tab.url)) {
        doInjectAppEvent(tab.url, tab)
            .catch(handleErrors);

    } else if (isCoinbaseAuthFlow() && isCoinbaseAuthenticatedUrl(tab.url)) {
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

        // URL on the current tab is supported and is a checkout page - auto render the extension
        const injectAppConditionalPromise = isCheckoutPage(tab.url)
            ? doInjectAppEvent(tab.url, tab)
            : doUpdateAuthUserEvent();

        injectAppConditionalPromise
            .then(() => doUpdateTabEvent(tab))
            .catch(handleErrors);

    } else {
        // URL that is on the current tab exists and is of a valid web schema but is not a supported site
        BrowserAction.setInvalidIcon(tab.id).catch(handleErrors);
        doUpdateTabEvent(tab)
            .then(doUpdateAuthUserEvent)
            .catch(handleErrors);

    }
};
