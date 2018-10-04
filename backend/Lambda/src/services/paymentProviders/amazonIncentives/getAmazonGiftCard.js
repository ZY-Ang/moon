/*
 * Copyright (c) 2018 moon
 */

const AmazonGiftCardClient = require('agcod');
const logHead = require("../../../utils/logHead");
const logTail = require("../../../utils/logTail");

const getAmazonGiftCard  = async (amount, currency, region) => {
    logHead("getAmazonGiftCard", {amount, currency, region});

    const amazonGiftCardClient = new AmazonGiftCardClient();

    const giftCardInfo = await new Promise((resolve, reject) =>
        amazonGiftCardClient.createGiftCard(region, amount, currency, (error, result) => {
            if(error){
                reject(error);
            }
            resolve(result);
        })
    );

    logTail("getAmazonGiftCard", giftCardInfo);
    return giftCardInfo;
};

module.exports = getAmazonGiftCard;
