/*
 * Copyright (c) 2018 moon
 */
const CoinbaseClient = require("coinbase").Client;

const getCoinbaseUser = async (coinbaseApiKeys) => {
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
        coinbaseClient.getCurrentUser((err, currentUser) => {
            if (err) {
                reject(err);
            } else if (!currentUser) {
                reject(new Error(`Coinbase returned malformed currentUser: ${currentUser}`));
            } else {
                resolve(currentUser);
            }
        })
    );
};

module.exports = getCoinbaseUser;
