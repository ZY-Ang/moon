/*
 * Copyright (c) 2018 moon
 */
const logHead = require("../../../utils/logHead");
const logTail = require("../../../utils/logTail");

/**
 * Gets the coinbase wallets (accounts) using
 * @see {@link https://developers.coinbase.com/api/v2#list-accounts}
 *
 * @param coinbaseClient - Coinbase Client instance
 * @return {Promise<object>}
 */
const getCoinbaseWallets = async (coinbaseClient) => {
    logHead("getCoinbaseWallets", coinbaseClient);

    const coinbaseWallets = await new Promise((resolve, reject) =>
        coinbaseClient.getAccounts({}, (err, accounts) => {
            if (err) {
                console.error(err);
                reject(err);
            } else if (!accounts) {
                reject(new Error(`Coinbase returned malformed accounts: ${accounts}`));
            } else {
                resolve(accounts);
            }
        })
    );

    logTail("coinbaseWallets", coinbaseWallets);
    return coinbaseWallets;
};

module.exports = getCoinbaseWallets;
