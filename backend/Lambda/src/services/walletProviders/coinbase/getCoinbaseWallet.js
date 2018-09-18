/*
 * Copyright (c) 2018 moon
 */
const logHead = require("../../../utils/logHead");
const logTail = require("../../../utils/logTail");

/**
 * Gets the coinbase wallet (account) associated with the specified currency
 * @see {@link https://developers.coinbase.com/api/v2#show-an-account}
 *
 * @param coinbaseWalletId - Coinbase Wallet Id of a wallet belonging to the user of
 * @param coinbaseClient - authenticated Coinbase Client instance.
 * @returns {Promise<Object>}
 */
const getCoinbaseWallet = async (coinbaseClient, coinbaseWalletId) => {
    logHead("getCoinbaseWallet", coinbaseClient);

    const coinbaseWallet = await new Promise((resolve, reject) =>
        coinbaseClient.getAccount(coinbaseWalletId, (err, account) => {
            if (err) {
                reject(err);
            } else if (!account) {
                reject(new Error(`Coinbase returned malformed account: ${account}`));
            } else {
                resolve(account);
            }
        })
    );

    logTail("coinbaseWallet", coinbaseWallet);
    return coinbaseWallet;
};

module.exports = getCoinbaseWallet;
