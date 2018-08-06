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
import {SOURCE_MANUAL, SOURCE_NONE} from "../constants/events/background";
import {Provider} from "react-redux";
import store from "./redux/store";
import {ACTION_SET_AUTH_USER} from "./redux/reducers/constants";
import Runtime from "./browser/Runtime";

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
export const injectApp = (source) => {
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
        moonStyles.innerHTML = `@import url("${Runtime.getURL('app.css')}")`;
        console.log("Appending styles to shadow...");
        moonShadow.appendChild(moonStyles);
    }
};

export const updateAuthUser = (authUser) =>
    store.dispatch({
        type: ACTION_SET_AUTH_USER,
        authUser
    });

reRenderApp();
Runtime.run();
