/*
 * Copyright (c) 2018 moon
 */
const getCoinbaseApiKeys = require("./services/walletProviders/coinbase/getCoinbaseApiKeys");
const getCoinbaseUser = require("./services/walletProviders/coinbase/getCoinbaseUser");
const getCoinbaseWallets = require("./services/walletProviders/coinbase/getCoinbaseWallets");

module.exports.handler = async (event) => {
    let {sub} = event;

    const coinbaseApiKeys = await getCoinbaseApiKeys(sub);
    const coinbaseWallets = await getCoinbaseWallets(coinbaseApiKeys);
    const coinbaseUser = await getCoinbaseUser(coinbaseApiKeys);

    return {
        coinbaseInfo: {
            userId: coinbaseUser.id,
            apiKey: {
                sub,
                key: coinbaseApiKeys.key
            },
            wallets: coinbaseWallets
        }
    };
};