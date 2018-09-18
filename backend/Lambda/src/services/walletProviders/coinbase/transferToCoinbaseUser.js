/*
 * Copyright (c) 2018 moon
 */
const logHead = require("../../../utils/logHead");
const logTail = require("../../../utils/logTail");

/**
 * Sends funds to the specified Coinbase user from the source wallet. This operation is instant.
 * @see {@link https://developers.coinbase.com/api/v2#send-money}
 *
 * @param sourceWallet - Source Coinbase wallet (account) object
 * @param targetAccountEmail - The email address of the destination Coinbase user
 * @param amountCrypto - The amount of funds to send to the target user from the source wallet
 * @return {Promise<object>}
 */
const transferToCoinbaseUser = async (sourceWallet, targetAccountEmail, amountCrypto) => {
    logHead("transferToCoinbaseUser", {sourceWallet, targetAccountEmail, amountCrypto});

    const params = {
        to: targetAccountEmail,
        amount: amountCrypto,
        currency: sourceWallet.balance.currency,
        description: "Your purchase through Moon"
    };
    const transferToCoinbaseUserInfo = await new Promise((resolve, reject) => {
        sourceWallet.sendMoney(params, (err, transferInfo) => {
            if (err) {
                reject(err);
            } else if (transferInfo.status !== 'completed') {
                reject(new Error(`The transaction from user\'s Coinbase account to Moon\'s Coinbase account failed.` +
                    ` Transaction id: ${transferInfo.id}. Status: ${transferInfo.status}`));
            } else {
                resolve(transferInfo);
            }
        });
    });

    logTail("transferToCoinbaseUserInfo", transferToCoinbaseUserInfo);
    return transferToCoinbaseUserInfo;
};

module.exports = transferToCoinbaseUser;
