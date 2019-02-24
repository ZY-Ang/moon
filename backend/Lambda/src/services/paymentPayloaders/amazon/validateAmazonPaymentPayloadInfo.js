/*
 * Copyright (c) 2019 moon
 */

import {base as supportedCartCurrencies} from "../../../constants/exchanges/coinbasePro/currencies";

export const validateAmazonCartInfo = (cartInfo) => {
    if (!cartInfo) {
        throw new Error("Invalid cartInfo: No cart info supplied");
    } else if (!cartInfo.amount) {
        throw new Error("Invalid cartInfo: Cart amount is not supplied");
    } else if (!cartInfo.currency) {
        throw new Error("Invalid cartInfo: Cart currency is not supplied");
    } else if (!supportedCartCurrencies[cartInfo.currency]) {
        throw new Error(`Invalid cartInfo: ${cartInfo.currency} is not a valid cart currency`);
    }
};

export const validateAmazonPageInfo = (pageInfo) => {
    if (!pageInfo)
};
