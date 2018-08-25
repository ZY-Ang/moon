/*
 * Copyright (c) 2018 moon
 */

import '../utils/preload.js';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import WebFont from 'webfontloader';
import App from "./components/App";
import {MOON_DIV_ID} from "../constants/dom";
import {SOURCE_MANUAL, SOURCE_NONE} from "../constants/events/backgroundEvents";
import {Provider} from "react-redux";
import store from "./redux/store";
import {ACTION_SET_AUTH_USER} from "./redux/reducers/constants";
import AppRuntime from "./browser/AppRuntime";
import {isCoinbaseSettingsApiUrl} from "../utils/url";
import {POLL_IS_COINBASE_AUTH_MODE, REQUEST_UPDATE_COINBASE_API_KEYS} from "../constants/events/appEvents";
import {
    ID_API_KEY_FORM,
    ID_API_KEYS_MODAL,
    QUERY_ACCOUNTS_ALL_CHECKBOX,
    QUERY_BACKGROUND_MODAL,
    IDS_SCOPE_COINBASE,
    STYLE_BACKGROUND_MODAL,
    QUERY_API_KEY_FORM_SUBMIT_BUTTON,
    QUERY_API_KEY_DISPLAY_ROOT,
    INNER_TEXT_API_KEY,
    INNER_TEXT_API_SECRET, ID_ADD_NEW_KEY_BUTTON
} from "../constants/coinbase";
import {handleErrors} from "../utils/errors";

/**
 * Load required font families from the appropriate libraries.
 * For more information, @see {@link https://www.npmjs.com/package/webfontloader}
 */
WebFont.load({
    google: {
        families: ['Raleway', 'Bellefair']
    }
});

/**
 * Re-renders app if div already exists.
 * This function should be executed on install or update.
 * If content window already exists, re-render a new version of it or do nothing.
 * NOTE: This is not the same as {@code toggleApp} where the render is toggled.
 */
const reRenderApp = () => {
    const moonDiv = document.getElementById(MOON_DIV_ID);
    if (!!moonDiv) {
        console.log("moonDiv found, re-rendering app");
        moonDiv.remove();
        toggleApp(SOURCE_MANUAL);
    }
};

// try {
//     var promoInput = document.getElementById('spc-gcpromoinput');
//     promoInput.value = "95UF-HDQQAT-3N62";
// // input.remove();
//
//     var submitButton = document.getElementById('gcApplyButtonId');
//     submitButton.click();
//     // todo: check for message "You successfully redeemed your gift card"

/**
 * Injects the app onto the page and uses
 * the given {@param source} to handle the
 * appropriate render logic. Or, if an app
 * already exists, remove it from the DOM.
 */
export const toggleApp = (source) => new Promise((resolve, reject) => {
    try {
        console.log("toggleApp request received from ", source);
        // Attempt to get the wrapper div
        let moonDiv = document.getElementById(MOON_DIV_ID);

        if (source === SOURCE_MANUAL && !!moonDiv) {
            // If the source of the injection came from a manual click of the
            // browserAction icon and a div already exists, destroy the div.
            console.log("Removing existing moonDiv...");
            moonDiv.remove();
            resolve("Removed div");
        } else if (source !== SOURCE_NONE && !moonDiv) {
            // If the source of the injection came from a source other than
            // {@code SOURCE_NONE}, and no div exists yet, create the new div

            // Create a new Moon Div
            console.log("Creating a new moon div");
            moonDiv = document.createElement("div");
            moonDiv.setAttribute("id", MOON_DIV_ID);
            document.body.appendChild(moonDiv);
            console.log("Creating a new moon div shadow");
            const moonShadow = moonDiv.attachShadow({mode: 'open'});

            console.log("Rendering App");
            ReactDOM.render((
                <Provider store={store}>
                    <App/>
                </Provider>
            ), moonShadow);
            console.log("Creating a new moon style element");
            const moonStyles = document.createElement('style');
            moonStyles.innerHTML = `@import url("${AppRuntime.getURL('app.css')}")`;
            console.log("Attaching styles to moon div shadow");
            moonShadow.appendChild(moonStyles);
            console.log("Extension successfully rendered");
            resolve("Extension successfully rendered");
        }
    } catch (error) {
        reject(error);
    }
});

// FIXME: handle orphaned content script @see {@link https://stackoverflow.com/questions/7792552/how-to-detect-chrome-extension-uninstall}
// FIXME: DE-EXECUTE CONTENT SCRIPT OR SOME SORT OF RECONNECT DISPLAY

/**
 * Updates the global {@param authUser} for the app
 */
export const updateAuthUser = (authUser) => new Promise(resolve =>
    resolve(store.dispatch({
        type: ACTION_SET_AUTH_USER,
        authUser
    })));

/**
 * Observes a particular DOM element for state mutations.
 * Particularly useful when used on a React App to obtain
 * OAuth flows, etc.
 *
 * TODO: Restructure to ES6 format?
 */
export const observeDOM = (obj, callback) => {
    const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    if (!obj || obj.nodeType !== 1) return; // validation

    if (MutationObserver) {
        // define a new observer
        const obs = new MutationObserver(function (mutations, observer) {
            if (mutations[0].addedNodes.length || mutations[0].removedNodes.length)
                callback(mutations[0]);
        });
        // have the observer observe foo for changes in children
        obs.observe(obj, {childList: true, subtree: true});

    } else if (window.addEventListener) {
        obj.addEventListener('DOMNodeInserted', callback, false);
        obj.addEventListener('DOMNodeRemoved', callback, false);
    }
};

/**
 * Requested by the background script to extract the api
 * keys from the coinbase page depending on the state of
 * the popup.
 */
export const doExtractCoinbaseApiKeys = () => {
    console.log("doExtractCoinbaseApiKeys");
    return AppRuntime.sendMessage(POLL_IS_COINBASE_AUTH_MODE)
        .then(({response}) => {
            if (response) {
                return response;
            } else {
                throw new Error("Received extraction from unknown source");
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
                    // 1. Blur background if it exists
                    if (document.querySelector(QUERY_BACKGROUND_MODAL)) {
                        document.querySelector(QUERY_BACKGROUND_MODAL).style = STYLE_BACKGROUND_MODAL;
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
                        // innerText as backup just in case Coinbase does anti-extraction or etc
                        resolve({
                            innerText: apiKeyDisplay.innerText,
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
                    console.log("API keys modal already being shown. Skipping button click");
                } else {
                    reject(new Error("Add new key button does not exist on DOM at load completion. Something bad has happened."));
                }
            } else {
                reject(new Error("Window is invalid or URL is not a valid authorization URL!"));
            }
        }))
        .then(apiKeys => AppRuntime.sendMessage(REQUEST_UPDATE_COINBASE_API_KEYS, apiKeys))
        // Handle errors here
        .catch(handleErrors);
};

reRenderApp();
AppRuntime.run();
