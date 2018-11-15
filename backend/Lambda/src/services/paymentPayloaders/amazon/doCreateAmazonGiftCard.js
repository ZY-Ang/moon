/*
 * Copyright (c) 2018 moon
 */
import logHead from "../../../utils/logHead";
import logTail from "../../../utils/logTail";
import AmazonGiftCardClient from "./agcod";
import {CONFIG_AGCOD} from "../../../constants/paymentPayloaders/amazon/config";

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
const doCreateAmazonGiftCard  = async (amount, currency, region) => {
    logHead("doCreateAmazonGiftCard", {amount, currency, region});

    const amazonGiftCardClient = new AmazonGiftCardClient(CONFIG_AGCOD);

    // Only issue full amount gift cards if in production
    if (process.env.NODE_ENV !== 'production') {
        amount = "0.01";
    }

    const giftCardInfo = await new Promise((resolve, reject) =>
        amazonGiftCardClient.createGiftCard(region, amount, currency, (error, result) => {
            if (error) {
                console.error(error);
                reject(error);
            } else {
                resolve(result);
            }
        })
    );

    logTail("doCreateAmazonGiftCard", giftCardInfo);
    return giftCardInfo;
};

export default doCreateAmazonGiftCard;
