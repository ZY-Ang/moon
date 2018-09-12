/*
 * Copyright (c) 2018 moon
 */

const {PublicClient} = require("gdax");
const {base, quote} = require("./constants/exchanges/gdax/currencies");

module.exports.handler = async (event) => {
    const publicClient = new PublicClient();

    if (!event.quote) {
        throw new Error("Please supply a valid quote currency.");

    } else if (!event.base) {
        throw new Error("Please supply a valid base currency.");

    } else if (!quote[event.quote]) {
        throw new Error(`${event.quote} is invalid or a currently unsupported quote currency.`);

    } else if (!base[event.base]) {
        throw new Error(`${event.base} is invalid or a currently unsupported base currency.`);

    }

    const tickerInformation = await publicClient.getProductTicker(`${event.quote}-${event.base}`);
    return {
        base: event.base,
        quote: event.quote,
        amount: tickerInformation.price
    };
};
