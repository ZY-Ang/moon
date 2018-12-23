/*
 * Copyright (c) 2018 moon
 */
import logHead from "../../../utils/logHead";
import logTail from "../../../utils/logTail";
import Decimal from "decimal.js";
import {URL} from "url";
import doCreateAmazonGiftCard from "./doCreateAmazonGiftCard";
import updatePaymentPayloadRecord from "../updatePaymentPayloadRecord";

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
                                    var txtSuccess = document.querySelector("#gc-success,#promo-success,.PromoEntrySuccess");
                                    var txtError = Array.from(document.querySelectorAll('.PromoEntryError,#addGiftCardOrPromo_Unknown,#addGiftCardOrPromo_NoCode,#addPromo_InvalidForPurchase,#addPromo_BadCode,#addPromo_ExpiredCode,#addPromo_InvalidForOrgUnit,#addPromo_OfferNotYetBegun,#addPromo_AlreadyRedeemed,#addGiftCard_AlreadyRedeemedByAnotherAccount,#addGiftCard_AlreadyRedeemedByThisAccount,#addGiftCard_BadCode,#addGiftCard_ExpiredCode,#addGiftCard_Cancelled,#addGiftCard_WrongOrgUnit,#addGiftCard_ServiceDown,#addGiftCard_Disabled,#addGiftCard_Teen_Disabled')).filter(function(e){return e.hasAttribute("style")})[0];
                                    var isElementHidden = function(htmlElement){
                                        return (!htmlElement || !!htmlElement.hidden || !htmlElement.hasAttribute("style") || htmlElement.style.display === "none" || !htmlElement.style.display.length);
                                    };
                                    if (isElementHidden(txtSuccess) && isElementHidden(txtError)) {
                                        timeoutFunction();
                                    } else if (!isElementHidden(txtError)) {
                                        reject(txtError.innerText.trim())
                                    } else if (!isElementHidden(txtSuccess)) {
                                        resolve(txtSuccess.innerText.trim());
                                    } else {
                                        timeoutFunction();
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
                setTimeout(function(){
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
                }, 3000);
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
})(${JSON.stringify(amazonGiftCards)}, '${process.env.NODE_ENV}');
`, {compress: true, mangle: true});

    const amazonPaymentPayload = {
        data: [executable],
        balance: cartInfo.amount,
        currency: cartInfo.currency
    };
    logTail("amazonPaymentPayload", amazonPaymentPayload);
    return amazonPaymentPayload;
};

export default getAmazonPaymentPayload;
