/*
 * Copyright (c) 2018 moon
 */
const logHead = require("../../../utils/logHead");
const logTail = require("../../../utils/logTail");
const CoinbaseClient = require("coinbase").Client;
const getCoinbaseApiKeys = require("./getCoinbaseApiKeys");

/**
 * Instantiates an instance of the coinbase client
 * using a {@param identity} object from an AppSync
 * {@code $context.identity} belonging to a end-user
 * of Moon.
 *
 * @returns {CoinbaseClient}
 */
const getCoinbaseUserClient = async (identity) => {
    logHead("getCoinbaseClient", identity);

    const {sub} = identity;
    const coinbaseApiKeys = await getCoinbaseApiKeys(sub);

    const coinbaseClient = new CoinbaseClient({
        apiKey: coinbaseApiKeys.key,
        apiSecret: coinbaseApiKeys.secret
    });

    logTail("coinbaseClient", coinbaseClient);
    return coinbaseClient;
};

module.exports = getCoinbaseUserClient;
