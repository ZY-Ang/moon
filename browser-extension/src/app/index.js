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
import AppRuntime from "./browser/AppRuntime";

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

/**
 * Updates the global {@param authUser} for the app
 */
export const updateAuthUser = (authUser) => new Promise(resolve =>
    resolve(store.dispatch({
        type: ACTION_SET_AUTH_USER,
        authUser
    })));

reRenderApp();
AppRuntime.run();
