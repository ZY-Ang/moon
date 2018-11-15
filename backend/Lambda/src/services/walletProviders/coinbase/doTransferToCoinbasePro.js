/*
 * Copyright (c) 2018 moon
 */
import logHead from "../../../utils/logHead";
import logTail from "../../../utils/logTail";

/**
 * Transfers funds from a user's Coinbase account to their Coinbase Pro account. This operation is instant.
 * @see {@link https://docs.gdax.com/#coinbase}
 *
 * @param authCoinbaseProClient - Authenticated GDAX client
 * @param amount - amount of funds to send from Coinbase to Coinbase Pro
 * @param currency - currency to send from Coinbase to Coinbase Pro
 * @param coinbaseAccountId - Coinbase account id with which to make the transfer
 * @return {Promise<object>}
 */
const doTransferToCoinbasePro = async (authCoinbaseProClient, amount, currency, coinbaseAccountId) => {
    logHead("doTransferToCoinbasePro", {authedGdaxClient: authCoinbaseProClient, amount, currency, coinbaseAccountId});

    const depositParams = {
        amount,
        currency,
        coinbase_account_id: coinbaseAccountId
    };
    const transferToCoinbaseProInfo = await authCoinbaseProClient.deposit(depositParams);

    logTail("transferToCoinbaseProInfo", transferToCoinbaseProInfo);
    return transferToCoinbaseProInfo;
};

export default doTransferToCoinbasePro;
