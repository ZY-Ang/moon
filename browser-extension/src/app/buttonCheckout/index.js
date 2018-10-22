/*
 * Copyright (c) 2018 moon
 */
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from "react-redux";
import store from "../redux/store";
import ButtonCheckout from "./ButtonCheckout";
import supportedSites from "../../../../backend/supportedSites.json";

const ID_BUTTON_CHECKOUT = "button-pay-with-moon";

export const injectButton = () => {
    const existingButton = document.getElementById(ID_BUTTON_CHECKOUT);
    if (!!existingButton) {
        existingButton.remove();
    }
    let moonButton=document.createElement("div");
    moonButton.id=ID_BUTTON_CHECKOUT;
    const elementInsertionScriptHostMap = {
        "www.amazon.com": (pathname) => {
            if (pathname.startsWith(supportedSites["www.amazon.com"].pathnameCheckout)) {
                const querySelectors = "#order-summary-box .a-box-inner, #subtotals .a-box-inner";
                const destinationBox = document.querySelectorAll(querySelectors)[0];
                if (destinationBox && destinationBox.children[1]) {
                    destinationBox.insertBefore(moonButton, destinationBox.children[1]);
                }
            } else if (pathname.startsWith(supportedSites["www.amazon.com"].pathnameProduct)) {
                const querySelectors = "#unifiedPrice_feature_div,#mediaPrice_feature_div";
                const destinationBox = document.querySelector(querySelectors);
                if (destinationBox) {
                    moonButton.style.maxWidth = '160px';
                    destinationBox.appendChild(moonButton);
                }
            }
        }
    };

    if (window && window.location && elementInsertionScriptHostMap[window.location.host]) {
        elementInsertionScriptHostMap[window.location.host](window.location.pathname);
        const moonButtonRoot = document.getElementById(ID_BUTTON_CHECKOUT);
        if (!!moonButtonRoot) {
            ReactDOM.render((
                <Provider store={store}>
                    <ButtonCheckout/>
                </Provider>
            ), document.getElementById(ID_BUTTON_CHECKOUT));
        }
    }
};
