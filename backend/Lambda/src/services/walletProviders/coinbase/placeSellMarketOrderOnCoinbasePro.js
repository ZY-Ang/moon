/*
 * Copyright (c) 2018 moon
 */
const logHead = require("../../../utils/logHead");
const logTail = require("../../../utils/logTail");

const {baseCurrencies, quoteCurrencies} = require("./constants/exchanges/gdax/currencies");

/**
 * Executes a market sell order on Coinbase Pro.
 * Account must have sufficient funds to complete the sale, including fees, or it will fail
 * @see {@link https://docs.gdax.com/#place-a-new-order}
 *
 * @param authedGdaxClient - Authenticated GDAX client
 * @param amount - amount of fiat funds to have after the trade is complete
 * @param baseCurrency - base currency for the trade
 * @param quoteCurrency - quote currency for the trade
 * @return {Promise<object>}
 */
const placeSellMarketOrderOnCoinbasePro = async (authedGdaxClient, amount, baseCurrency, quoteCurrency) => {
    logHead("placeSellMarketOrderOnCoinbasePro", event);

    // specifying the fiat amount we want after the trade
    const params = {
        type: 'market',
        side: 'sell',
        funds: amount,
        product_id: `${quoteCurrency}-${baseCurrency}`,
    };
    const orderInfo = await authedGdaxClient.sell(params);

    logTail("placeSellMarketOrderOnCoinbasePro", orderInfo);
    return orderInfo;
};

module.exports = placeSellMarketOrderOnCoinbasePro;
