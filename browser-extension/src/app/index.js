/*
 * Copyright (c) 2018 moon
 */

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from "./components/App";
import {MOON_DIV_ID} from "../constants/dom";
import {REQUEST_INJECT_APP, SOURCE_NONE} from "../constants/events";

// try {
//     var promoInput = document.getElementById('spc-gcpromoinput');
//     promoInput.value = "95UF-HDQQAT-3N62";
// // input.remove();
//
//     var submitButton = document.getElementById('gcApplyButtonId');
//     submitButton.click();
//     // todo: check for message "You successfully redeemed your gift card"

const injectApp = (source) => {
    // Only inject if the source is not {@code SOURCE_NONE}
    if (source !== SOURCE_NONE) {
        // Destroy any existing elements and it's trees with {@code MOON_DIV_ID} if they exist
        let moonDiv = document.getElementById(MOON_DIV_ID);
        if (!!moonDiv) {
            console.log("removing existing moonDiv... Source: ", source);
            moonDiv.remove();
        } else {
            console.log("injectApp request received, rendering... Source: ", source);
            console.log(MOON_DIV_ID);

            // Create a new Moon Div
            moonDiv = document.createElement("div");
            document.body.appendChild(moonDiv);
            moonDiv.setAttribute("id", MOON_DIV_ID);
            ReactDOM.render(<App source={source} />, moonDiv);
        }
    }
};

// Listen to requests from the background script
chrome.runtime.onMessage.addListener((request, sender, response) => {
    // If message is injectApp
    switch (request.type) {
        case REQUEST_INJECT_APP:
            // Inject our app to DOM and send response
            try {
                injectApp(request.source);
                response({startedExtension: true});
            } catch (e) {
                response({startedExtension: false});
            }
            return;
        default:
            console.log("Received message but not a known one.");
            console.log("Request:", request);
            console.log("Sender:", sender);
            response({startedExtension: false});
            return;
    }
});
