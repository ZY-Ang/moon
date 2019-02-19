/*
 * Copyright (c) 2018 moon
 */
import logHead from "../../../utils/logHead";
import logTail from "../../../utils/logTail";
import Decimal from "decimal.js";
import {URL} from "url";
import doCreateAmazonGiftCard from "./doCreateAmazonGiftCard";
import updatePaymentPayloadRecord from "../updatePaymentPayloadRecord";
import generateAmazonPaymentPayload from "./generateAmazonPaymentPayload";

/**
 * @param paymentPayloadId - payment payload ID for records
 *
 * @param cartInfo - checkout page cart information
 *                  that should contain {@code amount}
 *                  and {@code currency}
 *
 * @param pageInfo - checkout page page information that
 *                  can contain {@code url}, {@code content}
 *                  for debug
 */
const getAmazonPaymentPayload = async (paymentPayloadId, cartInfo, pageInfo) => {
    logHead("getAmazonPaymentPayload", {paymentPayloadId, cartInfo, pageInfo});
    const {amount: purchaseAmount, currency: purchaseCurrency} = cartInfo;
    // pageInfo logged in cloudFormation is sufficient for debug.
    // DO NOT log pageInfo to dynamodb as row data will be too expensive.
    const {url} = pageInfo;
    const {host} = new URL(url);

    const regionHostMap = {
        "www.amazon.com": "NA",
        "www.amazon.ca": "NA",
        "www.amazon.com.mx": "NA",
        "www.amazon.it": "EU",
        "www.amazon.es": "EU",
        "www.amazon.de": "EU",
        "www.amazon.fr": "EU",
        "www.amazon.co.uk": "EU",
        "www.amazon.co.jp": "FE",
        "www.amazon.com.au": "FE"
    };
    const REGION = regionHostMap[host];

    // 1. Issue Amazon gift card(s)
    let amazonGiftCards = [];
    let remaining = new Decimal(purchaseAmount);
    while (remaining.gt(0)) {
        if (remaining.gt(2000)) {
            amazonGiftCards.push(await doCreateAmazonGiftCard("2000", purchaseCurrency, REGION));
            remaining = remaining.minus(2000);
        } else {
            amazonGiftCards.push(await doCreateAmazonGiftCard(remaining.toString(), purchaseCurrency, REGION));
            remaining = new Decimal(0);
        }
    }

    // 2. Store gift card information directly into database
    await updatePaymentPayloadRecord(paymentPayloadId, {amazonGiftCards});

    // TODO: FIGURE OUT WHAT HONEY is doing with 'applyCodesClick'
    const executable = generateAmazonPaymentPayload(amazonGiftCards, process.env.NODE_ENV, paymentPayloadId);

    const amazonPaymentPayload = {
        data: [executable],
        balance: cartInfo.amount,
        currency: cartInfo.currency
    };
    logTail("amazonPaymentPayload", amazonPaymentPayload);
    return amazonPaymentPayload;
};

export default getAmazonPaymentPayload;
