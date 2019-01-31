/*
 * Copyright (c) 2018 moon
 */

import appLogger from "./utils/AppLogger";
import AppRuntime from "./browser/AppRuntime";
import quicksandEot from '../../../assets/fonts/Quicksand/fonts/quicksand-v8-latin-regular.eot';
import quicksandWoff from '../../../assets/fonts/Quicksand/fonts/quicksand-v8-latin-regular.woff';
import quicksandWoff2 from '../../../assets/fonts/Quicksand/fonts/quicksand-v8-latin-regular.woff2';
import ralewayEot from '../../../assets/fonts/Raleway/fonts/raleway-v12-latin-regular.eot';
import ralewayWoff from '../../../assets/fonts/Raleway/fonts/raleway-v12-latin-regular.woff';
import ralewayWoff2 from '../../../assets/fonts/Raleway/fonts/raleway-v12-latin-regular.woff2';
import './index.css';
import App from "./components/App";
import {MOON_DIV_ID} from "./constants/dom";
import {SOURCE_MANUAL, SOURCE_NONE} from "../constants/events/backgroundEvents";
import {Provider} from "react-redux";
import store from "./redux/store";
import axios from "axios";
import {ACTION_SET_IS_APP_ACTIVE, ACTION_TOGGLE_IS_APP_ACTIVE} from "./redux/reducers/constants";
import {injectButton} from "./buttonMoon";
import React from 'react';
import ReactDOM from 'react-dom';

/**
 * Re-renders app if div already exists.
 * This function should be executed on install or update.
 * If content window already exists, re-render a new version of it or do nothing.
 * NOTE: This is not the same as {@code toggleApp} where the render is toggled.
 */
const initializeApp = () => {
    const moonDiv = document.getElementById(MOON_DIV_ID);
    if (!!moonDiv) {
        appLogger.log("moonDiv found, re-rendering app");
        moonDiv.remove();
        toggleApp(SOURCE_MANUAL).catch();
    }
};

/**
 * Injects the app onto the page and uses
 * the given {@param source} to handle the
 * appropriate render logic. Or, if an app
 * already exists, remove it from the DOM.
 */
export const toggleApp = async (source, tabInfo) => {
    appLogger.log("toggleApp request received from ", source);
    // Attempt to get the wrapper div
    let moonDiv = document.getElementById(MOON_DIV_ID);

    if (source === SOURCE_MANUAL && !!moonDiv) {
        // If the source of the injection came from a manual click of the
        // browserAction icon or moon pay buttons and a div already exists,
        // toggle the render state.
        appLogger.log("Toggling existing moonDiv...");
        store.dispatch({type: ACTION_TOGGLE_IS_APP_ACTIVE});
        return true;

    } else if (source !== SOURCE_NONE && !moonDiv) {
        // If the source of the injection came from a source other than
        // {@code SOURCE_NONE}, and no div exists yet, create the new div

        // Create Moon Div (Wrapper)
        appLogger.log("Creating a new moon div");
        moonDiv = document.createElement("div");
        moonDiv.setAttribute("id", MOON_DIV_ID);
        document.body.appendChild(moonDiv);

        // Create Moon Shadow of Moon Div
        appLogger.log("Creating a new moon div shadow");
        const moonShadow = moonDiv.attachShadow({mode: 'open'});

        // Create Styles of Moon Shadow
        appLogger.log("Adding styles");
        const fontStyles = document.createElement("style");
        fontStyles.type = "text/css";
        fontStyles.textContent =
            `@font-face{font-family:Quicksand;font-style:normal;font-weight:400;src:url('${AppRuntime.getURL(quicksandEot)}');` +
            `src:url('${AppRuntime.getURL(quicksandWoff2)}') format("woff2"),` +
            `url('${AppRuntime.getURL(quicksandWoff)}') format("woff")}` +
            `@font-face{font-family:Raleway;font-style:normal;font-weight:400;src:url('${AppRuntime.getURL(ralewayEot)}');` +
            `src:url('${AppRuntime.getURL(ralewayWoff2)}') format("woff2"),` +
            `url('${AppRuntime.getURL(ralewayWoff)}') format("woff")}`;

        const moonStyles = document.createElement("style");
        moonStyles.type = "text/css";
        moonStyles.textContent = (await axios.get(AppRuntime.getURL('app.css'))).data;

        // Render React Application onto shadow child
        appLogger.log("Rendering App");
        ReactDOM.render((
            <Provider store={store}>
                <App/>
            </Provider>
        ), moonShadow);

        // Append styles after rendering application (has to be done after the application render)
        moonShadow.appendChild(fontStyles);
        moonShadow.appendChild(moonStyles);

        // Dispatch application active action
        store.dispatch({type: ACTION_SET_IS_APP_ACTIVE, isAppActive: true});
        return true;
    }
};

// TODO: handle orphaned content script @see {@link https://stackoverflow.com/questions/7792552/how-to-detect-chrome-extension-uninstall}

AppRuntime.run();
initializeApp();
injectButton();
