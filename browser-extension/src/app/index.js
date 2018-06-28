/*
 * Copyright (c) 2018 moon
 */

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import WebFont from 'webfontloader';
import App from "./components/App";
import {MOON_DIV_ID} from "../constants/dom";
import {REQUEST_INJECT_APP, SOURCE_MANUAL, SOURCE_NONE} from "../constants/events";

/**
 * Load required font families from the appropriate libraries.
 * For more information, @see {@link https://www.npmjs.com/package/webfontloader}
 */
WebFont.load({
    google: {
        families: ['Raleway', 'Bellefair']
    }
});

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
        document.body.appendChild(moonDiv);
        moonDiv.setAttribute("id", MOON_DIV_ID);
        ReactDOM.render(<App/>, moonDiv);
    }
};

/**
 * Listen to requests from the background script
 */
chrome.runtime.onMessage.addListener((request, sender, response) => {
    // If message is injectApp
    switch (request.type) {
        case REQUEST_INJECT_APP:
            // Attempt to inject our app to DOM and send appropriate response
            try {
                injectApp(request.source);
                response({success: true});
            } catch (e) {
                response({error: e});
            }
            return;
        default:
            console.error("Received message but not a known one.\nRequest: ", request, "\nSender: ", sender);
            response({error: new Error("Received message but not a known one.")});
            return;
    }
});
