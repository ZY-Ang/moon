/*
 * Copyright (c) 2018 moon
 */

const {PublicClient} = require("gdax");

module.exports.handler = async (event) => {
    const publicClient = new PublicClient();

    const {currency} = event;
    const baseCurrency = event.baseCurrency || "USD";

    // TODO: Export to global constants
    const coinbaseCurrencies = {
        ETH: true,
        BTC: true,
        BCH: true,
        LTC: true
    };

    if (!currency || !coinbaseCurrencies[currency]) {
        throw new Error("Invalid Currency");
    }

    return publicClient.getProductTicker(`${currency}-${baseCurrency}`)
        .then(tickerInformation => ({
            amount: tickerInformation.price,
            currency: event.currency
        }))
        .catch(console.error);
};
