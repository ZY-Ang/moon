/*
 * Copyright (c) 2018 moon
 */
const logHead = require("./utils/logHead");
const logTail = require("./utils/logTail");
const baseCurrencies = require("./constants/exchanges/coinbasePro/currencies").base;
const quoteCurrencies = require("./constants/exchanges/coinbasePro/currencies").quote;
const getCoinbaseProExchangeRate = require('./services/walletProviders/coinbase/getCoinbaseProExchangeRate');

module.exports.handler = async (event) => {
    logHead("exchangeRate", event);

    if (!event.quote) {
        throw new Error("Please supply a valid quote currency.");

    } else if (!event.base) {
        throw new Error("Please supply a valid base currency.");

    } else if (!quoteCurrencies[event.quote]) {
        throw new Error(`${event.quote} is invalid or a currently unsupported quote currency.`);

    } else if (!baseCurrencies[event.base]) {
        throw new Error(`${event.base} is invalid or a currently unsupported base currency.`);
    }

    const exchangeRate = await getCoinbaseProExchangeRate(event.quote, event.base);

    logTail("exchangeRate", exchangeRate);
    return exchangeRate;
};
