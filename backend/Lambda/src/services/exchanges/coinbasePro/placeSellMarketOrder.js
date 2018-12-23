/*
 * Copyright (c) 2018 moon
 */
import logHead from "../../../utils/logHead";
import logTail from "../../../utils/logTail";

/**
 * Executes a market sell order on Coinbase Pro.
 * Account must have sufficient funds to complete the sale, including fees, or it will fail
 * @see {@link https://docs.gdax.com/#place-a-new-order}
 *
 * @param coinbaseProClient - Authenticated CoinbasePro client
 * @param amount - amount of fiat funds to have after the trade is complete
 * @param baseCurrency - base currency for the trade
 * @param quoteCurrency - quote currency for the trade
 * @return {Promise<object>}
 */
const placeSellMarketOrder = async (coinbaseProClient, amount, quoteCurrency, baseCurrency) => {
    logHead("placeSellMarketOrder", {amount, quoteCurrency, baseCurrency});

    // specifying the fiat amount we want after the trade
    const params = {
        type: 'market',
        side: 'sell',
        funds: amount,
        product_id: `${quoteCurrency}-${baseCurrency}`,
    };
    const sellMarketOrderInfo = await coinbaseProClient.sell(params);

    logTail("sellMarketOrderInfo", sellMarketOrderInfo);
    return sellMarketOrderInfo;
};

export default placeSellMarketOrder;
