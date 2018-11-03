/*
 * Copyright (c) 2018 moon
 */

import '../utils/preload.js';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import WebFont from 'webfontloader';
import App from "./components/App";
import {MOON_DIV_ID} from "./constants/dom";
import {SOURCE_MANUAL, SOURCE_NONE} from "../constants/events/backgroundEvents";
import {Provider} from "react-redux";
import store from "./redux/store";
import AppRuntime from "./browser/AppRuntime";
import axios from "axios";
import {ACTION_SET_IS_APP_ACTIVE, ACTION_TOGGLE_IS_APP_ACTIVE} from "./redux/reducers/constants";
import {injectButton} from "./buttonMoon";

/**
 * Load required font families from the appropriate libraries.
 * For more information, @see {@link https://www.npmjs.com/package/webfontloader}
 */
WebFont.load({
    google: {
        families: ['Quicksand', 'Raleway']
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
        toggleApp(SOURCE_MANUAL)
            .then(res => {
                if (res) {
                    console.log("App re-rendered");
                }
            });
    }
    injectButton();
};

/**
 * Injects the app onto the page and uses
 * the given {@param source} to handle the
 * appropriate render logic. Or, if an app
 * already exists, remove it from the DOM.
 */
export const toggleApp = async (source) => {
    console.log("toggleApp request received from ", source);
    // Attempt to get the wrapper div
    let moonDiv = document.getElementById(MOON_DIV_ID);

    if ((source === SOURCE_MANUAL) && !!moonDiv) {
        // If the source of the injection came from a manual click of the
        // browserAction icon or moon pay buttons and a div already exists,
        // toggle the render state.
        console.log("Toggling existing moonDiv...");
        store.dispatch({type: ACTION_TOGGLE_IS_APP_ACTIVE});
        return true;

    } else if (source !== SOURCE_NONE && !moonDiv) {
        // If the source of the injection came from a source other than
        // {@code SOURCE_NONE}, and no div exists yet, create the new div

        // Create Moon Div (Wrapper)
        console.log("Creating a new moon div");
        moonDiv = document.createElement("div");
        moonDiv.setAttribute("id", MOON_DIV_ID);
        document.body.appendChild(moonDiv);

        // Create Moon Shadow of Moon Div
        console.log("Creating a new moon div shadow");
        const moonShadow = moonDiv.attachShadow({mode: 'open'});

        // Create Styles of Moon Shadow
        console.log("Creating a new moon style element");
        const moonStyles = document.createElement('style');
        moonStyles.innerHTML = (await axios.get(AppRuntime.getURL('app.css'))).data;

        // Render React Application onto shadow child
        console.log("Rendering App");
        ReactDOM.render((
            <Provider store={store}>
                <App/>
            </Provider>
        ), moonShadow);

        // Append styles after rendering application (has to be done after the application render)
        moonShadow.appendChild(moonStyles);

        // Dispatch application active action
        store.dispatch({type: ACTION_SET_IS_APP_ACTIVE, isAppActive: true});
        return true;
    }
};

// TODO: handle orphaned content script @see {@link https://stackoverflow.com/questions/7792552/how-to-detect-chrome-extension-uninstall}

reRenderApp();
AppRuntime.run();
