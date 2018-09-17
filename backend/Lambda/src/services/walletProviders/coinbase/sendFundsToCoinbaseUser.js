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
const sendFundsToCoinbaseUser = async (sourceWallet, targetAccountEmail, amountCrypto) => {
    logHead("sendFundsToCoinbaseUser", amountCrypto);

    const transaction = await new Promise((resolve, reject) => {
        let args = {
            to: targetAccountEmail,
            amount: amountCrypto,
            currency: sourceWallet.balance.currency,
            description: "Your purchase through Moon"
        };
        sourceWallet.sendMoney(args, (err, transaction) => {
            if (err) {
                reject(err);
            }
            if(transaction.status !== 'completed'){
                throw new Error (`The transaction from user\'s Coinbase account to Moon\'s Coinbase account failed. 
                                    Transaction id: ${transaction.id}. Status: ${transaction.status}`);
            }
            resolve(transaction);
        });
    });

    logTail("sendFundsToCoinbaseUser", transaction);
    return transaction;
};

module.exports = sendFundsToCoinbaseUser;
