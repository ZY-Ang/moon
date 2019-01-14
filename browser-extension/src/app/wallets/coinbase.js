/*
 * Copyright (c) 2018 moon
 */
import AppRuntime from "../browser/AppRuntime";
import {POLL_IS_COINBASE_AUTH_MODE, REQUEST_UPDATE_COINBASE_API_KEYS} from "../../constants/events/appEvents";
import {isCoinbaseSettingsApiUrl} from "../../utils/coinbase";
import {observeDOM} from "../utils/dom";
import {
    ID_ADD_NEW_KEY_BUTTON,
    ID_API_KEY_FORM,
    ID_API_KEYS_MODAL,
    IDS_SCOPE_COINBASE,
    INNER_TEXT_API_KEY,
    INNER_TEXT_API_SECRET,
    QUERY_ACCOUNTS_ALL_CHECKBOX,
    QUERY_API_KEY_DISPLAY_ROOT,
    QUERY_API_KEY_FORM_SUBMIT_BUTTON,
    QUERY_BACKGROUND_MODAL,
    QUERY_MODAL_HEADER_CLOSE_BUTTON,
    QUERY_MODAL_HEADER_TITLE,
    STYLE_BACKGROUND_MODAL,
    TEXT_MODAL_HEADER_TITLE
} from "../../constants/coinbase";
import {URL_COINBASE_POST_CONNECTION} from "../../constants/url";
import appLogger from "../utils/AppLogger";
import AppMixpanel from "../services/AppMixpanel";

/**
 * Requested by the background script to extract the api
 * keys from the coinbase page depending on the state of
 * the popup.
 */
export const doExtractCoinbaseApiKeys = () => {
    appLogger.log("doExtractCoinbaseApiKeys");
    return AppRuntime.sendMessage(POLL_IS_COINBASE_AUTH_MODE)
        .then(response => {
            if (response) {
                return response;
            } else {
                throw new Error("Received extraction from unknown source or is not in auth flow");
            }
        })
        .then(() => new Promise((resolve, reject) => {
            // Front end XSS check for if is valid coinbase API URL
            if (!!window &&
                !!window.location &&
                !!window.location.href &&
                isCoinbaseSettingsApiUrl(window.location.href)
            ) {
                // Continuously observe changes to the DOM subtree of {@code ID_API_KEYS_MODAL}
                observeDOM(document.getElementById(ID_API_KEYS_MODAL), () => {
                    // 1. Blur background and change other UI elements
                    if (document.querySelector(QUERY_BACKGROUND_MODAL)) {
                        document.querySelector(QUERY_BACKGROUND_MODAL).style = STYLE_BACKGROUND_MODAL;
                    }
                    if (
                        document.querySelector(QUERY_MODAL_HEADER_TITLE) &&
                        document.querySelector(QUERY_MODAL_HEADER_TITLE).innerHTML !== TEXT_MODAL_HEADER_TITLE
                    ) {
                        document.querySelector(QUERY_MODAL_HEADER_TITLE).innerHTML = TEXT_MODAL_HEADER_TITLE;
                    }
                    if (!!document.querySelector(QUERY_MODAL_HEADER_CLOSE_BUTTON)) {
                        document.querySelector(QUERY_MODAL_HEADER_CLOSE_BUTTON).remove();
                    }
                    // 2. If the api key form exists, user has approved via 2FA and we can begin authorization
                    if (document.getElementById(ID_API_KEY_FORM)) {
                        // Note: Fields should exist at this point. If runtime error, we should be
                        // notified immediately as coinbase has most likely updated their UI.

                        // 2.1. Click the all accounts checkbox
                        document.querySelector(QUERY_ACCOUNTS_ALL_CHECKBOX).click();

                        // 2.2. Click all the necessary scopes required to access the API using the obtained keys
                        IDS_SCOPE_COINBASE.forEach(scopeId => document.getElementById(scopeId).click());

                        // 2.3. Submit the form to display the API keys
                        document.querySelector(QUERY_API_KEY_FORM_SUBMIT_BUTTON).click();

                        // 3. If the subtree is currently showing the API key
                    } else if (document.querySelector(QUERY_API_KEY_DISPLAY_ROOT)) {
                        // Grab the API Key, duh.
                        const apiKeyDisplay = document.querySelector(QUERY_API_KEY_DISPLAY_ROOT);
                        const apiKeyDisplayChildren = apiKeyDisplay.children;
                        Array.from(apiKeyDisplayChildren).forEach(child => child.style.opacity = "0");
                        let apiKey = null;
                        let apiSecret = null;
                        for (let i = 0; i < apiKeyDisplayChildren.length; i++) {
                            const child = apiKeyDisplayChildren[i];
                            if (child.innerText.startsWith(INNER_TEXT_API_KEY)) {
                                apiKey = child.innerText.split(':')[1].trim();
                            } else if (child.innerText.startsWith(INNER_TEXT_API_SECRET)) {
                                apiSecret = child.innerText.split(':')[1].trim();
                            }
                        }
                        AppMixpanel.track('successfully_connected_coinbase');
                        AppMixpanel.people.set({'Connected Coinbase': true});
                        // innerHTML as backup just in case Coinbase does anti-extraction or etc
                        resolve({
                            innerHTML: document.getElementById(ID_API_KEYS_MODAL).innerHTML,
                            apiKey,
                            apiSecret
                        });
                    }
                });

                // 0. If the API form does not exist yet, click the button programmatically.
                if (document.getElementById(ID_ADD_NEW_KEY_BUTTON) &&
                    document.getElementById(ID_API_KEYS_MODAL).children.length === 0
                ) {
                    document.getElementById(ID_ADD_NEW_KEY_BUTTON).click();
                } else if (document.getElementById(ID_API_KEYS_MODAL).children.length !== 0) {
                    appLogger.log("API keys modal already being shown. Skipping button click");
                } else {
                    reject(new Error("Add new key button does not exist on DOM at load completion. Something bad has happened."));
                }
            } else {
                reject(new Error("Window is invalid or URL is not a valid authorization URL!"));
            }
        }))
        .then(apiKeys => AppRuntime.sendMessage(REQUEST_UPDATE_COINBASE_API_KEYS, apiKeys))
        .then(() => window.location.replace(URL_COINBASE_POST_CONNECTION))
        .catch(err => appLogger.error("doExtractCoinbaseApiKeys exception: ", err));
};