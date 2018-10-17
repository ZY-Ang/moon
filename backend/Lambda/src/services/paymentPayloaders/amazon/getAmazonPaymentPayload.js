/*
 * Copyright (c) 2018 moon
 */
const logHead = require("../../../utils/logHead");
const logTail = require("../../../utils/logTail");
const Decimal = require("decimal.js");
const getAmazonGiftCard = require("./getAmazonGiftCard");

const getAmazonPaymentPayload = async (cartInfo, pageInfo) => {
    logHead("getAmazonPaymentPayload", {cartInfo, pageInfo});
    const {amount: purchaseAmount, currency: purchaseCurrency} = cartInfo;
    // TODO: Store {@code pageInfo} in a database somewhere so we can debug
    const {url, content} = pageInfo;

    // TODO: Add Host Router - Host 'www.amazon.com' is only in 'NA' (North America - inclusive of Mexico, Canada).
    const REGION = 'NA';

    // 1. Issue Amazon gift card(s)
    let giftCards = [];
    let remaining = new Decimal(purchaseAmount);
    while (remaining.gt(0)) {
        if (remaining.gt(2000)) {
            giftCards.push(await getAmazonGiftCard("2000", purchaseCurrency, REGION));
            remaining = remaining.minus(2000);
        } else {
            giftCards.push(await getAmazonGiftCard(remaining.toString(), purchaseCurrency, REGION));
            remaining = new Decimal(0);
        }
    }

    // 2. TODO: Store {@code amazonGiftCard} in a database together with order trail somewhere in case we need to cancel the gift card. See {@link https://pypi.org/project/agcod/} for example response in python. Roughly similar in agcod for node but check just in case.
    // db.put(giftCards)

    // TODO: FIGURE OUT WHAT HONEY is doing with 'applyCodesClick'
    const executable = require("harp-minify").js(`
var giftCards = ${JSON.stringify(giftCards)};
var successfulGiftCards = [];
var failedGiftCards = [];

giftCards
    .reduce(function(prev, giftCard){
        return prev
            .then(function(){
                return (function(code){
                    return fetch("https://www.amazon.com/gp/buy/spc/handlers/add-giftcard-promotion.html/ref=ox_pay_page_gc_add", {
                        method: "POST",
                        mode: "cors",
                        cache: "no-cache",
                        credentials: "same-origin",
                        headers: {
                            "Content-Type": "application/json; charset=utf-8",
                            "x-amz-checkout-page": "spc"
                        },
                        redirect: "follow",
                        referrer: "no-referrer",
                        body: JSON.stringify({
                            claimcode: code
                        }),
                    })
                        .then(function(res){return res.json()});
                })(giftCard.gcClaimCode);
            })
            .then(function(result){
                if (result.errors.length > 0) {
                    throw result;
                } else {
                    return successfulGiftCards.push({
                        giftCard: giftCard,
                        result: result
                    });
                }
            })
            .catch(function(errorResult){
                return failedGiftCards.push({
                    giftCard: giftCard,
                    result: errorResult
                });
            });
    }, Promise.resolve())
    .then(function(){
        return new Promise(function(resolve, reject){
            const browserMessage = {
                message: "MOON_NOTIFY_PAYMENT_COMPLETION",
                giftCards: giftCards,
                successfulGiftCards: successfulGiftCards,
                failedGiftCards: failedGiftCards
            }
            if (chrome && chrome.runtime) {
                chrome.runtime.sendMessage(browserMessage, function(response){
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else if (response.success) {
                        resolve(response.response);
                    } else {
                        reject(response);
                    }
                });
            } else if (browser && browser.runtime) {
                resolve(browser.runtime.sendMessage(browserMessage));
            }
        });
    })
    .catch(console.error);
`, {compress: false, mangle: false}); // FIXME: Click pay for user

    const amazonPaymentPayload = {
        data: [executable],
        balance: cartInfo.amount,
        currency: cartInfo.currency
    };
    logTail("amazonPaymentPayload", amazonPaymentPayload);
    return amazonPaymentPayload;
};

module.exports = getAmazonPaymentPayload;
