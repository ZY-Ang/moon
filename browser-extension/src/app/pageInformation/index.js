/*
 * Copyright (c) 2018 moon
 */

import AppRuntime from "../browser/AppRuntime";
import {REQUEST_GET_SITE_INFORMATION} from "../../constants/events/appEvents";
import Decimal from "decimal.js";
import store from "../redux/store";
import {
    ACTION_SET_APP_MODAL_LOADING_STATE,
    ACTION_SET_PAGE_INFORMATION
} from "../redux/reducers/constants";
import {isCheckoutPage} from "../../utils/url";
import {handleErrors} from "../../utils/errors";
import {observeDOM} from "../utils/dom";

const getSiteInformation = async (siteInformation) => {
    if (siteInformation) {
        return siteInformation;
    } else if (window && window.location && window.location.host) {
        return AppRuntime.sendMessage(REQUEST_GET_SITE_INFORMATION, {host: window.location.host});
    } else {
        return Promise.reject("window object invalid: " + JSON.stringify(window));
    }
};

const parsePageInformation = async (siteInformation) => {
    const parserHostMap = {
        "www.amazon.com": () => {
            const parse = () => {
                setAppModalLoadingState({isActive: true, loadingText: "Loading..."});
                const cartAmountElements = document.querySelectorAll(siteInformation.querySelectorCartAmount);
                const cartCurrencyElements = document.querySelectorAll(siteInformation.querySelectorCartCurrency);
                const productTitleElements = document.querySelectorAll(siteInformation.querySelectorProductTitle);
                const productImageElements = document.querySelectorAll(siteInformation.querySelectorProductImage);
                const productPriceElements = document.querySelectorAll(siteInformation.querySelectorProductPrice);
                const cartAmount = !!cartAmountElements && !!cartAmountElements.length && (
                    (
                        !!cartAmountElements[0].value &&
                        Decimal(cartAmountElements[0].value.replace(/[^0-9.-]+/g, '')).toFixed(2)
                    ) || (
                        !!cartAmountElements[0].innerText &&
                        Decimal(cartAmountElements[0].innerText.replace(/[^0-9.-]+/g, '')).toFixed(2)
                    )
                );
                const pageInformation = {
                    ...siteInformation,
                    isCheckoutPage: isCheckoutPage(window.location.href, siteInformation.pathnameCheckout),
                    cartAmount: (
                        !!cartAmount &&
                        (Number(cartAmount) > 0) &&
                        process.env.NODE_ENV !== 'production'
                    )
                        ? "0.01"
                        : cartAmount ? cartAmount : "0.00",
                    cartCurrency: (cartCurrencyElements && cartCurrencyElements.length && cartCurrencyElements[0].value) || "USD",
                    productTitle: productTitleElements && productTitleElements[0] && productTitleElements[0].innerText,
                    productImageURL: productImageElements && productImageElements[0] && productImageElements[0].src,
                    productImageAlt: productImageElements && productImageElements[0] && productImageElements[0].alt,
                    productPrice: productPriceElements &&
                        productPriceElements[0] &&
                        Number(productPriceElements[0].innerText.replace(/[^0-9.-]+/g, ""))
                };
                setPageInformationState(pageInformation);
                setAppModalLoadingState({isActive: false});
                return pageInformation;
            };

            const elementTreesToObserve = document.querySelectorAll(siteInformation.querySelectorParseObserver);
            for (let element of elementTreesToObserve) {
                observeDOM(element, parse);
            }
            return parse();
        }
    };
    if (parserHostMap[window.location.host]) {
        return parserHostMap[window.location.host]();
    }
};

const setPageInformationState = (pageInformation) => {
    return store.dispatch({
        type: ACTION_SET_PAGE_INFORMATION,
        pageInformation
    });
};

const setAppModalLoadingState = (state) => {
    return store.dispatch({
        ...state,
        type: ACTION_SET_APP_MODAL_LOADING_STATE
    })
};

const loadPageInformation = (siteInformation) => {
    return getSiteInformation(siteInformation)
        .then(parsePageInformation)
        .catch(handleErrors);
};

export default loadPageInformation;
