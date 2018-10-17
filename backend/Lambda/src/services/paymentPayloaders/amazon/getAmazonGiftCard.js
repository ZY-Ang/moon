/*
 * Copyright (c) 2018 moon
 */
const logHead = require("../../../utils/logHead");
const logTail = require("../../../utils/logTail");
const AmazonGiftCardClient = require("./agcod");
const {CONFIG_AGCOD} = require("../../../constants/paymentPayloaders/amazon/config");

/**
 * Gets an Amazon Gift Card
 * @param amount {string} - amount that the gift card should hold.
 * @param currency {string} - currencyCode in which the gift card should be in.
 * @param region {'NA'|'EU'|'FE'} - Region of the gift card issue.
 *      NA - North America (US/CA/MX)   (us-east-1)
 *      EU - Europe (IT/ES/DE/FR/UK)    (eu-west-1)
 *      FE - Asian Pacific (JP/AU)      (us-west-2)
 * @returns {Promise<any>}
 */
const getAmazonGiftCard  = async (amount, currency, region) => {
    logHead("getAmazonGiftCard", {amount, currency, region});

    const amazonGiftCardClient = new AmazonGiftCardClient(CONFIG_AGCOD);

    const giftCardInfo = await new Promise((resolve, reject) => {
        amazonGiftCardClient.createGiftCard(region, amount, currency, (error, result) => {
            if (error) {
                console.error(error);
                reject(error);
            } else {
                resolve(result);
            }
        });
    });

    logTail("getAmazonGiftCard", giftCardInfo);
    return giftCardInfo;
};

module.exports = getAmazonGiftCard;
