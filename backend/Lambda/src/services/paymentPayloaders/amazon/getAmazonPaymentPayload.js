/*
 * Copyright (c) 2018 moon
 */
const logHead = require("../../../utils/logHead");
const logTail = require("../../../utils/logTail");
const Decimal = require("decimal.js");
const {URL} = require("url");
const doCreateAmazonGiftCard = require("./doCreateAmazonGiftCard");

const getAmazonPaymentPayload = async (cartInfo, pageInfo) => {
    logHead("getAmazonPaymentPayload", {cartInfo, pageInfo});
    const {amount: purchaseAmount, currency: purchaseCurrency} = cartInfo;
    // TODO: Store {@code pageInfo} in a database somewhere so we can debug
    const {url, content} = pageInfo;
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
    let giftCards = [];
    let remaining = new Decimal(purchaseAmount);
    while (remaining.gt(0)) {
        if (remaining.gt(2000)) {
            giftCards.push(await doCreateAmazonGiftCard("2000", purchaseCurrency, REGION));
            remaining = remaining.minus(2000);
        } else {
            giftCards.push(await doCreateAmazonGiftCard(remaining.toString(), purchaseCurrency, REGION));
            remaining = new Decimal(0);
        }
    }

    // 2. TODO: Store {@code amazonGiftCard} in a database together with order trail somewhere in case we need to cancel the gift card. See {@link https://pypi.org/project/agcod/} for example response in python. Roughly similar in agcod for node but check just in case.
    // db.put(giftCards)

    // TODO: FIGURE OUT WHAT HONEY is doing with 'applyCodesClick'
    const executable = require("harp-minify").js(`
(function(giftCards, environment) {
    var applyButton = document.querySelectorAll(".a-button.a-spacing-micro .a-button-inner input,#gcApplyButtonId,.PromoEntryButton input[type='submit']")[0];
    var txtGc = document.querySelectorAll("#spc-gcpromoinput,input[name='code'].PromoEntryField")[0];
    var successfulGiftCards = [];
    var failedGiftCards = [];
    return giftCards
        .reduce(function(prev, giftCard){
            return prev
                .then(function(){
                    return new Promise(function(resolve, reject){
                        txtGc.value = giftCard.gcClaimCode;
                        applyButton.click();
                        var timeoutFunction = function(){
                            setTimeout(function(){
                                var loadingSpinner = document.querySelectorAll("#payment .section-overwrap,#loading-spinner-blocker-doc")[0];
                                if (loadingSpinner && loadingSpinner.style.display !== 'none') {
                                    timeoutFunction();
                                } else {
                                    var txtSuccess = document.querySelectorAll("#gc-success,.PromoEntrySuccess")[0];
                                    var txtError = document.querySelectorAll("#gc-error,.PromoEntryError")[0];
                                    var isElementHidden = function(htmlElement){
                                        return (!!htmlElement.hidden || htmlElement.style.display === "none");
                                    };
                                    if (!txtSuccess) {
                                        reject("txtSuccess does not exist");
                                    } else if (isElementHidden(txtSuccess) && !txtError) {
                                        reject("txtSuccess is hidden and txtError missing");
                                    } else if (isElementHidden(txtSuccess)) {
                                        reject(txtError.innerText.trim());
                                    } else if (isElementHidden(txtError) && isElementHidden(txtSuccess)) {
                                        timeoutFunction();
                                    } else {
                                        resolve(txtSuccess.innerText.trim());
                                    }
                                }
                            }, 1000);
                        };
                        timeoutFunction();
                    });
                })
                .then(function(result){
                    return successfulGiftCards.push({
                        giftCard: giftCard,
                        result: result
                    });
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
                };
                if (environment !== 'production') {
                    console.log("browserMessage: ", browserMessage);
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
        .then(function(){
            var submitButton = document.querySelectorAll(".a-button-text.place-your-order-button,#submitOrderButtonId,.MusicCartReviewButtonSection input[type='submit']")[0];
            if (submitButton) {
                submitButton.click();
            }
        })
        .catch(function(err){
            console.error("Something seriously bad happened: ", err);
        });
})(${JSON.stringify(giftCards)}, '${process.env.NODE_ENV}');
`, {compress: true, mangle: true});

    const amazonPaymentPayload = {
        data: [executable],
        balance: cartInfo.amount,
        currency: cartInfo.currency
    };
    logTail("amazonPaymentPayload", amazonPaymentPayload);
    return amazonPaymentPayload;
};

module.exports = getAmazonPaymentPayload;
