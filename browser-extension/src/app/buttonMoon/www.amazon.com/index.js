import React from "react";
import {isCheckoutPage} from "../../../utils/url";
import {ID_BUTTON_PAY_WITH_MOON_PRIMARY} from "../index";
import ReactDOM from "react-dom";
import Provider from "react-redux/es/components/Provider";
import store from "../../redux/store";
import ButtonMoon from "../ButtonMoon";

const querySelectorMoonButton = "#order-summary-box .a-box-inner,#subtotals .a-box-inner,.MusicCartReviewButtonSection .a-box-inner,#unifiedPrice_feature_div,#mediaPrice_feature_div";

const injectAmazonPayWithMoonButtons = () => {
    const existingButton = document.getElementById(ID_BUTTON_PAY_WITH_MOON_PRIMARY);
    if (!!existingButton) {
        ReactDOM.unmountComponentAtNode(existingButton);
        existingButton.remove();
    }
    let moonButton=document.createElement("div");
    moonButton.id=ID_BUTTON_PAY_WITH_MOON_PRIMARY;
    const destinationBox = document.querySelectorAll(querySelectorMoonButton)[0];
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
    const moonButtonRoot = document.getElementById(ID_BUTTON_PAY_WITH_MOON_PRIMARY);
    if (!!moonButtonRoot) {
        ReactDOM.render((
            <Provider store={store}>
                <ButtonMoon/>
            </Provider>
        ), document.getElementById(ID_BUTTON_PAY_WITH_MOON_PRIMARY));
    }
};

export default injectAmazonPayWithMoonButtons;
