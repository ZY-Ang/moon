/*
 * Copyright (c) 2018 moon
 */

const Client = require('agcod');
const client = new Client();

const logHead = require("../../../utils/logHead");
const logTail = require("../../../utils/logTail");

const getAmazonGiftCard  = async (amount, currency = 'USD', region = 'NA') => {

    logHead("getAmazonGiftCard", amount);

    const giftCardInfo = await new Promise((resolve, reject) =>
        client.createGiftCard(region, amount, currency, (error, result) => {
            console.log('client.createGiftCard response', error, result);
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
