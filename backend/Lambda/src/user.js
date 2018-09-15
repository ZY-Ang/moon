/*
 * Copyright (c) 2018 moon
 */
const logHead = require("./utils/logHead");
const logTail = require("./utils/logTail");
const getCoinbaseUserClient = require("./services/walletProviders/coinbase/getCoinbaseUserClient");
const getCoinbaseCurrentUser = require("./services/walletProviders/coinbase/getCoinbaseCurrentUser");
const getCoinbaseWallets = require("./services/walletProviders/coinbase/getCoinbaseWallets");

module.exports.handler = async (event) => {
    logHead("user", event);
    const {identity} = event;

    const coinbaseClient = await getCoinbaseUserClient(identity);
    const [coinbaseWallets, coinbaseUser] = await Promise.all([
        getCoinbaseWallets(coinbaseClient),
        getCoinbaseCurrentUser(coinbaseClient)
    ])
        .catch(() => [null, null]);

    const user = {
        coinbaseInfo: {
            user: coinbaseUser,
            wallets: coinbaseWallets && coinbaseWallets.map(wallet => ({
                id: wallet.id,
                name: wallet.name,
                currency: wallet.balance && wallet.balance.currency,
                balance: wallet.balance && wallet.balance.amount
            }))
        }
    };

    logTail("user", user);
    return user;
};