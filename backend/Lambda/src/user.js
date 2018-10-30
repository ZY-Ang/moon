/*
 * Copyright (c) 2018 moon
 */
const logHead = require("./utils/logHead");
const logTail = require("./utils/logTail");
const supportedCurrencies = require("./constants/walletProviders/coinbase/currencies");
const CoinbaseClient = require("coinbase").Client;
const getCoinbaseApiKeys = require("./services/walletProviders/coinbase/getCoinbaseApiKeys");
const getCoinbaseCurrentUser = require("./services/walletProviders/coinbase/getCoinbaseCurrentUser");
const getCoinbaseWallets = require("./services/walletProviders/coinbase/getCoinbaseWallets");

const user = async (event) => {
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
        signUpState: {
            referredBy: null
        },
        coinbaseInfo: coinbaseApiKeys ? {
            user: coinbaseUser,
            wallets: coinbaseWallets && coinbaseWallets
                .filter(wallet => (supportedCurrencies[wallet.balance.currency]))
                .map(wallet => ({
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

module.exports.handler = user;
