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
import {REQUEST_INJECT_APP, REQUEST_UPDATE_AUTH_USER, SOURCE_MANUAL, SOURCE_NONE} from "../constants/events/background";
import {Provider} from "react-redux";
import store from "./redux/store";
import {ACTION_SET_AUTH_USER} from "./redux/reducers/constants";
import {extensionId} from "../constants/extension";

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
 * NOTE: This is not the same as {@code injectApp} where the render is toggled.
 */
const reRenderApp = () => {
    const moonDiv = document.getElementById(MOON_DIV_ID);
    if (!!moonDiv) {
        console.log("moonDiv found, re-rendering app");
        moonDiv.remove();
        injectApp(SOURCE_MANUAL);
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
 * appropriate render logic.
 */
const injectApp = (source) => {
    console.log("injectApp request received from ", source);
    // Attempt to get the wrapper div
    let moonDiv = document.getElementById(MOON_DIV_ID);

    if (source === SOURCE_MANUAL && !!moonDiv) {
        // If the source of the injection came from a manual click of the
        // browserAction icon and a div already exists, destroy the div.
        console.log("Removing existing moonDiv...");
        moonDiv.remove();
    } else if (source !== SOURCE_NONE && !moonDiv) {
        // If the source of the injection came from a source other than
        // {@code SOURCE_NONE}, and no div exists yet, create the new div
        console.log("Rendering...");

        // Create a new Moon Div
        moonDiv = document.createElement("div");
        moonDiv.setAttribute("id", MOON_DIV_ID);
        document.body.appendChild(moonDiv);
        const moonShadow = moonDiv.attachShadow({mode: 'open'});

        ReactDOM.render((
            <Provider store={store}>
                <App />
            </Provider>
        ), moonShadow);
        const moonStyles = document.createElement('style');
        moonStyles.innerHTML = `@import url("${chrome.runtime.getURL('app.css')}")`;
        console.log("Appending styles to shadow...");
        moonShadow.appendChild(moonStyles);
    }
};

const updateAuthUser = (authUser) =>
    store.dispatch({
        type: ACTION_SET_AUTH_USER,
        authUser
    });

reRenderApp();

/**
 * Listen to requests from the background script
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Always ensure message extension sender is our own
    if (sender.id !== extensionId) {
        return;
    }
    const {message, authUser, source} = request;
    switch (message) {
        // If message is injectApp,
        case REQUEST_INJECT_APP:
            // Attempt to inject our app to DOM and send appropriate response
            try {
                injectApp(source);
                sendResponse({success: true});
            } catch (e) {
                sendResponse({error: e});
            }
            break;
        case REQUEST_UPDATE_AUTH_USER:
            try {
                updateAuthUser(authUser);
                sendResponse({success: true});
            } catch (e) {
                sendResponse({error: e});
            }
            break;
        default:
            console.warn("Received an unknown message.\nRequest: ", request, "\nSender: ", sender);
            break;
    }
});
