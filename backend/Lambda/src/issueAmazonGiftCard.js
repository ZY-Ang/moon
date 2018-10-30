/*
 * Copyright (c) 2018 moon
 */
const doCreateAmazonGiftCard = require("./services/paymentPayloaders/amazon/doCreateAmazonGiftCard");

/**
 * Issues an amazon gift card using the agcod API. Do not recursively call this function.
 *
 * IMPORTANT: Only call this function on the AWS console.
 */
const issueAmazonGiftCard = async (event) => {
    if (!event.amount || !event.currency || !event.region) {
        throw new Error("Invalid input");
    }
    return doCreateAmazonGiftCard(event.amount, event.currency, event.region);
};

module.exports.handler = issueAmazonGiftCard;
