/*
 * Copyright (c) 2018 moon
 */
const logHead = require("./utils/logHead");
const logTail = require("./utils/logTail");
const CoinbaseClient = require("coinbase").Client;
const getCoinbaseApiKeys = require("./services/walletProviders/coinbase/getCoinbaseApiKeys");
const getCoinbaseCurrentUser = require("./services/walletProviders/coinbase/getCoinbaseCurrentUser");
const getCoinbaseWallets = require("./services/walletProviders/coinbase/getCoinbaseWallets");

module.exports.handler = async (event) => {
    logHead("user", event);
    const {identity} = event;

    // coinbaseInfo
    const coinbaseApiKeys = await getCoinbaseApiKeys(identity.sub);
    const isValidCoinbaseApiKeys = (coinbaseApiKeys && coinbaseApiKeys.key && coinbaseApiKeys.secret);
    const coinbaseClient = (isValidCoinbaseApiKeys)
        ? new CoinbaseClient({
            apiKey: coinbaseApiKeys.key,
            apiSecret: coinbaseApiKeys.secret
        })
        : null;
    const [coinbaseWallets, coinbaseUser] = (isValidCoinbaseApiKeys)
        ? await Promise.all([
            getCoinbaseWallets(coinbaseClient),
            getCoinbaseCurrentUser(coinbaseClient)
        ])
            .catch(() => [null, null])
        : [null, null];

    const user = {
        coinbaseInfo: coinbaseApiKeys ? {
            user: coinbaseUser,
            wallets: coinbaseWallets && coinbaseWallets.map(wallet => ({
                id: wallet.id,
                name: wallet.name,
                currency: wallet.balance && wallet.balance.currency,
                balance: wallet.balance && wallet.balance.amount
            }))
        } : null
    };

    logTail("user", user);
    return user;
};