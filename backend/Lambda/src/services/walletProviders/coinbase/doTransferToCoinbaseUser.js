/*
 * Copyright (c) 2018 moon
 */
import logHead from "../../../utils/logHead";
import logTail from "../../../utils/logTail";

/**
 * Sends funds to the specified Coinbase user from the source wallet. This operation is instant.
 * @see {@link https://developers.coinbase.com/api/v2#send-money}
 *
 * @param sourceWallet - Source Coinbase wallet (account) object
 * @param targetAccountEmail - The email address of the destination Coinbase user
 * @param amount - The amount of funds to send to the target user from the source wallet
 * @return {Promise<object>}
 */
const doTransferToCoinbaseUser = async (sourceWallet, targetAccountEmail, amount) => {
    logHead("doTransferToCoinbaseUser", {sourceWallet, targetAccountEmail, amount});

    const params = {
        to: targetAccountEmail,
        amount,
        currency: sourceWallet.balance.currency,
        description: "Your purchase through Moon"
    };
    const transferToCoinbaseUserInfo = await new Promise((resolve, reject) => {
        sourceWallet.sendMoney(params, (err, transferInfo) => {
            if (err) {
                console.error(err);
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

export default doTransferToCoinbaseUser;
