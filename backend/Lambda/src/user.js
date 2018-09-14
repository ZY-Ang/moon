/*
 * Copyright (c) 2018 moon
 */
const getCoinbaseApiKeys = require("./services/walletProviders/coinbase/getCoinbaseApiKeys");
const getCoinbaseUser = require("./services/walletProviders/coinbase/getCoinbaseUser");
const getCoinbaseWallets = require("./services/walletProviders/coinbase/getCoinbaseWallets");

module.exports.handler = async (event) => {
    let {sub} = event;

    const coinbaseApiKeys = await getCoinbaseApiKeys(sub);
    const [coinbaseWallets, coinbaseUser] = (coinbaseApiKeys)
        ? await Promise.all([
            getCoinbaseWallets(coinbaseApiKeys),
            getCoinbaseUser(coinbaseApiKeys)
        ]).catch(() => [null, null])
        : [null, null];

    return {
        coinbaseInfo: {
            user: coinbaseUser,
            apiKey: coinbaseApiKeys,
            wallets: coinbaseWallets && coinbaseWallets.map(wallet => ({
                id: wallet.id,
                name: wallet.name,
                currency: wallet.balance && wallet.balance.currency,
                balance: wallet.balance && wallet.balance.amount
            }))
        }
    };
};