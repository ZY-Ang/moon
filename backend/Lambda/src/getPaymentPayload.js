/*
 * Copyright (c) 2018 moon
 */
const logHead = require("./utils/logHead");
const logTail = require("./utils/logTail");
const {URL} = require('url');
const getUser = require("./user").handler;
const {base: supportedCartCurrencies} = require("./constants/exchanges/coinbasePro/currencies");
const validateWallet = require("./services/walletProviders/validateWallet");
const doTransferToMoon = require("./services/walletProviders/doTransferToMoon");
const isSupportedSite = require("./services/paymentPayloaders/isSupportedSite");
const getAmazonPaymentPayload = require("./services/paymentPayloaders/amazon/getAmazonPaymentPayload");

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

    const {arguments: args, identity} = event;
    validateInput(args.input);
    const {cartInfo, wallet, pageInfo} = args.input;

    // 1. Pay Moon. If payment fails, function should break.
    await doTransferToMoon(identity, cartInfo, wallet);

    // 2. Handle payment payload logic TODO: REFUND user if error
    const getPaymentPayloadHostMap = {
        "www.amazon.com": getAmazonPaymentPayload
    };
    const {host} = new URL(pageInfo.url);
    const hostPaymentPayload = await getPaymentPayloadHostMap[host](cartInfo, pageInfo);

    // 3. Get the updated user object after the money has been sent
    const user = await getUser(event);
    const paymentPayload = Object.assign(hostPaymentPayload, {
        id: `TEST-TRANSACTION-${require("randomstring").generate(8)}`,
        user
    });

    logTail("paymentPayload", paymentPayload);
    return paymentPayload;
};

module.exports.handler = getPaymentPayload;
