/*
 * Copyright (c) 2018 moon
 */
const CoinbaseClient = require("coinbase").Client;

/**
 * Gets the coinbase wallets using
 * @param coinbaseApiKeys - Coinbase API Keys
 * @return {Promise<any>}
 */
const getCoinbaseWallets = async (coinbaseApiKeys) => {
    if (!coinbaseApiKeys ||
        !coinbaseApiKeys.key ||
        !coinbaseApiKeys.secret
    ) {
        throw new Error("Invalid coinbase API Keys");
    }

    let coinbaseClient = new CoinbaseClient({
        apiKey: coinbaseApiKeys.key,
        apiSecret: coinbaseApiKeys.secret
    });

    return new Promise((resolve, reject) =>
        coinbaseClient.getAccounts({}, (err, accounts) => {
            if (err) {
                reject(err);
            } else if (!accounts.data) {
                reject(new Error("Coinbase returned malformed accounts data"));
            } else {
                resolve(accounts.data.map(({id, name, balance}) => ({
                    id,
                    name,
                    currency: balance.currency,
                    balance: balance.amount
                })));
            }
        })
    );
};

module.exports = getCoinbaseWallets;
