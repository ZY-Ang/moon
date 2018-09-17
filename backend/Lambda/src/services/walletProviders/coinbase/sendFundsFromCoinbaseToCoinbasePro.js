/*
 * Copyright (c) 2018 moon
 */
const logHead = require("../../../utils/logHead");
const logTail = require("../../../utils/logTail");

/**
 * Transfers funds from a user's Coinbase account to their Coinbase Pro account. This operation is instant.
 * @see {@link https://docs.gdax.com/#coinbase}
 *
 * @param authedGdaxClient - Authenticated GDAX client
 * @param amount - amount of funds to send from Coinbase to Coinbase Pro
 * @param currency - currency to send from Coinbase to Coinbase Pro
 * @param coinbaseAccountId - Coinbase account id with which to make the transfer
 * @return {Promise<object>}
 */
const sendFundsFromCoinbaseToCoinbasePro = async (authedGdaxClient, amount, currency, coinbaseAccountId) => {
    logHead("sendFundsFromCoinbaseToCoinbasePro", event);

    const depositParams = {
        amount: amount,
        currency: currency,
        coinbase_account_id: coinbaseAccountId
    };
    const depositInfo = await authedGdaxClient.deposit(depositParams);

    logTail("sendFundsFromCoinbaseToCoinbasePro", depositInfo);
    return depositInfo;
};

module.exports = sendFundsFromCoinbaseToCoinbasePro;
