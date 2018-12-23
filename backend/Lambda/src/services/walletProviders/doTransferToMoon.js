/*
 * Copyright (c) 2018 moon
 */
import logHead from "../../utils/logHead";
import logTail from "../../utils/logTail";
import doTransferToMoonCoinbase from "./coinbase/doTransferToMoonCoinbase";

/**
 * Get Paid. Duh.
 */
const doTransferToMoon = async (identity, paymentPayloadId, cartInfo, wallet) => {
    logHead("doTransferToMoon", {identity, cartInfo, wallet});
    const {id: walletID, provider} = wallet;
    const {sub} = identity;

    const walletProviderMap = {
        COINBASE() {
            return doTransferToMoonCoinbase(paymentPayloadId, sub, walletID, cartInfo);
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

export default doTransferToMoon;
