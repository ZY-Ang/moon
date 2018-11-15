/*
 * Copyright (c) 2018 moon
 */
import logHead from "../../../utils/logHead";
import logTail from "../../../utils/logTail";
import {getPublicClient} from "../../exchanges/coinbasePro/client";

/**
 * Gets the Coinbase Pro exchange rate for the specified currency pair
 * @see {@link https://docs.gdax.com/#get-product-order-book}
 *
 * @param quote - quote currency for the exchange rate
 * @param base - base currency for the exchange rate
 * @return {Promise<object>}
 */
const getExchangeRate = async (quote, base) => {
    logHead("coinbasePro.getExchangeRate", {quote, base});
    const publicClient = getPublicClient();

    const {bid, ask} = await publicClient.getProductTicker(`${quote}-${base}`);
    // We return the bid price since we are selling and this is closer to what will be executed
    // TODO: In marketing, you want to give your user the higher exchange rate so there is a perception of superiority
    const exchangeRate = {
        base,
        quote,
        bid,
        ask
    };

    logTail("coinbasePro.exchangeRate", exchangeRate);
    return exchangeRate;
};

export default getExchangeRate;
