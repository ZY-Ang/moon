/*
 * Copyright (c) 2018 moon
 */
const logHead = require("../../utils/logHead");
const logTail = require("../../utils/logTail");
const doTransferToMoonCoinbase = require("./coinbase/doTransferToMoonCoinbase");

/**
 * Get Paid. Duh.
 */
const doTransferToMoon = async (identity, cartInfo, wallet) => {
    logHead("doTransferToMoon", {identity, cartInfo, wallet});
    // TODO: Logic - imagine multiple reserve pools under multiple currencies.
    //          Transfer to moon will transfer to the base currency pool of which the transaction is to be settled.
    //          The only risk that remains is currency risk up to the limit of the reserve pool size
    const {id: walletID, provider} = wallet;
    const {sub} = identity;

    const walletProviderMap = {
        COINBASE() {
            return doTransferToMoonCoinbase(sub, walletID, cartInfo);
        }
    };

    if (!walletProviderMap[provider]) {
        throw new Error(`Wallet provider (${provider}) is invalid or unsupported.`);
    } else {
        const transferToMoonResult = await walletProviderMap[provider]();
        logTail("transferToMoonResult", transferToMoonResult);
        return transferToMoonResult;
    }
};

module.exports = doTransferToMoon;
