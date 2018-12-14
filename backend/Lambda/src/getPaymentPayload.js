/*
 * Copyright (c) 2018 moon
 */
import moment from "moment";
import logHead from "./utils/logHead";
import logTail from "./utils/logTail";
import updateTransactionRecord from "./utils/updateTransactionRecord";
import {URL} from "url";
import getUser from "./user";
import {base as supportedCartCurrencies} from "./constants/exchanges/coinbasePro/currencies";
import validateWallet from "./services/walletProviders/validateWallet";
import doTransferToMoon from "./services/walletProviders/doTransferToMoon";
import isSupportedSite from "./services/paymentPayloaders/isSupportedSite";
import getAmazonPaymentPayload from "./services/paymentPayloaders/amazon/getAmazonPaymentPayload";

/**
 * Validates {@param getPaymentPayloadInput} for
 * {@function getPaymentPayload}
 */
const validateInput = (getPaymentPayloadInput) => {
    if (!getPaymentPayloadInput) {
        throw new Error("Invalid getPaymentPayloadInput: No input supplied");
    }
    const {cartInfo, pageInfo, wallet} = getPaymentPayloadInput;
    validateCartInfo(cartInfo);
    validateWallet(wallet);
    validatePageInfo(pageInfo);
};

/**
 * Validates {@param cartInfo}
 */
const validateCartInfo = (cartInfo) => {
    if (!cartInfo) {
        throw new Error("Invalid cartInfo: No cart info supplied");
    } else if (!cartInfo.amount) {
        throw new Error("Invalid cartInfo: Cart amount is not supplied");
    } else if (!cartInfo.currency) {
        throw new Error("Invalid cartInfo: Cart currency is not supplied");
    } else if (!supportedCartCurrencies[cartInfo.currency]) {
        throw new Error(`Invalid cartInfo: ${cartInfo.currency} is not a valid cart currency`);
    }
};

/**
 * Validates {@param pageInfo}
 */
const validatePageInfo = (pageInfo) => {
    if (!pageInfo) {
        throw new Error("Invalid pageInfo: No page info supplied");
    } else if (!pageInfo.url) {
        throw new Error("Invalid pageInfo: No url supplied");
    } else if (!isSupportedSite(pageInfo.url)) {
        throw new Error(`${pageInfo.url} is not a supported site.`);
    } else if (!pageInfo.content) {
        throw new Error("Invalid pageInfo: No content supplied");
    }
};

const getPaymentPayload = async (event) => {
    logHead("getPaymentPayload", event);

    const {arguments: args, identity, id, datetime} = event;
    validateInput(args.input);
    const {cartInfo, wallet, pageInfo} = args.input;

    // generate a unique id for this transaction
    const {sub} = identity;
    const transactionRecordData = {
        sub: sub,
        datetime: datetime,
        baseCurrency: cartInfo.currency,
        baseAmount: cartInfo.amount,
        walletProvider: wallet.provider,
        walletId: wallet.id
    };
    await updateTransactionRecord(id, transactionRecordData);

    // 1. Pay Moon. If payment fails, function should break.
    await doTransferToMoon(identity, id, cartInfo, wallet);

    // 2. Handle payment payload logic TODO: REFUND user if error
    const getPaymentPayloadHostMap = {
        "www.amazon.com": getAmazonPaymentPayload
    };
    const {host} = new URL(pageInfo.url);
    let hostPaymentPayload = await getPaymentPayloadHostMap[host](cartInfo, pageInfo);

    // 3. Get the updated user object after the money has been sent
    const user = await getUser(event);
    const paymentPayload = Object.assign(hostPaymentPayload, {
        id: `TEST-TRANSACTION-${require("randomstring").generate(8)}`, // FIXME: Update transaction ID
        user
    });

    logTail("paymentPayload", paymentPayload);
    return paymentPayload;
};

export default getPaymentPayload;
