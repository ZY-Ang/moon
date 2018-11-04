/*
 * Copyright (c) 2018 moon
 */
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from "react-redux";
import store from "../redux/store";
import ButtonMoon from "./ButtonMoon";
import supportedSites from "../../../../backend/supportedSites.json";
import {isCheckoutPage} from "../../utils/url";

const ID_BUTTON_PAY_WITH_MOON = "button-pay-with-moon";

export const injectButton = () => {
    const existingButton = document.getElementById(ID_BUTTON_PAY_WITH_MOON);
    if (!!existingButton) {
        ReactDOM.unmountComponentAtNode(existingButton);
        existingButton.remove();
    }
    let moonButton=document.createElement("div");
    moonButton.id=ID_BUTTON_PAY_WITH_MOON;
    const moonButtonInjectionScriptHostMap = {
        "www.amazon.com": (pathname) => {
            const destinationBox = document.querySelectorAll(supportedSites["www.amazon.com"].querySelectorMoonButton)[0];
            if (isCheckoutPage(window.location.href)) {
                if (destinationBox && destinationBox.children[1]) {
                    destinationBox.insertBefore(moonButton, destinationBox.children[1]);
                }
            } else {
                if (destinationBox) {
                    moonButton.style.maxWidth = '160px';
                    destinationBox.appendChild(moonButton);
                }
            }
        }
    };

    if (window && window.location && moonButtonInjectionScriptHostMap[window.location.host]) {
        moonButtonInjectionScriptHostMap[window.location.host](window.location.pathname);
        const moonButtonRoot = document.getElementById(ID_BUTTON_PAY_WITH_MOON);
        if (!!moonButtonRoot) {
            ReactDOM.render((
                <Provider store={store}>
                    <ButtonMoon/>
                </Provider>
            ), document.getElementById(ID_BUTTON_PAY_WITH_MOON));
        }
    }
};
