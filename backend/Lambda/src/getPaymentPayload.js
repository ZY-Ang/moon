/*
 * Copyright (c) 2018 moon
 */
import logHead from "./utils/logHead";
import logTail from "./utils/logTail";
import updatePaymentPayloadRecord from "./services/paymentPayloaders/updatePaymentPayloadRecord";
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

const getPaymentPayload = async (event, context) => {
    logHead("getPaymentPayload", {event, context});

    const {awsRequestId, logGroupName, logStreamName} = context;
    const {arguments: args, identity, createdOn} = event;
    validateInput(args.input);
    const {cartInfo, wallet, pageInfo} = args.input;

    // generate a unique id for this transaction
    const {sub} = identity;
    const paymentPayloadId = `${sub}_${createdOn}_${awsRequestId}`;
    await updatePaymentPayloadRecord(paymentPayloadId, {
        sub,
        createdOn,
        logGroupName,
        logStreamName,
        baseCurrency: cartInfo.currency,
        baseAmount: cartInfo.amount,
        walletProvider: wallet.provider,
        walletId: wallet.id
    });

    // 1. Pay Moon. If payment fails, function should break.
    await doTransferToMoon(identity, paymentPayloadId, cartInfo, wallet);

    // 2. Handle payment payload logic TODO: REFUND user if error
    const getPaymentPayloadHostMap = {
        "www.amazon.com": getAmazonPaymentPayload
    };
    const {host} = new URL(pageInfo.url);
    let hostPaymentPayload = await getPaymentPayloadHostMap[host](paymentPayloadId, cartInfo, pageInfo);

    // 3. Get the updated user object after the money has been sent
    const user = await getUser(event);
    const paymentPayload = Object.assign(hostPaymentPayload, {
        id: paymentPayloadId,
        user
    });

    await updatePaymentPayloadRecord(paymentPayloadId, {paymentPayload});

    logTail("paymentPayload", paymentPayload);
    return paymentPayload;
};

export default getPaymentPayload;
