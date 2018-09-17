/*
 * Copyright (c) 2018 moon
 */
const logHead = require("../../../utils/logHead");
const logTail = require("../../../utils/logTail");

const {PublicClient} = require("gdax");

/**
 * Gets the Coinbase Pro exchange rate for the specified currency pair
 * @see {@link https://docs.gdax.com/#get-product-order-book}
 *
 * @param base - base currency for the exchange rate
 * @param quote - quote currency for the exchange rate
 * @return {Promise<object>}
 */
const getCoinbaseProExchangeRate = async (base, quote) => {
    logHead("getCoinbaseProExchangeRate", event);
    const publicClient = new PublicClient();

    const tickerInformation = await publicClient.getProductTicker(`${quote}-${base}`);
    // we return the bid price since we are selling and this is closer to what will be executed
    const exchangeRate = {
        base: base,
        quote: quote,
        amount: tickerInformation.bid
    };

    logTail("getCoinbaseProExchangeRate", exchangeRate);
    return exchangeRate;
};

module.exports = getCoinbaseProExchangeRate;
