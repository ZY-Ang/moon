/*
 * Copyright (c) 2019 moon
 */

import minify from "harp-minify";

const generateAmazonPaymentPayload = (amazonGiftCards, environment, paymentPayloadId) => minify.js(`
(function(giftCards, environment, paymentPayloadId) {
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
                                    var txtError = Array.from(document.querySelectorAll('.PromoEntryError,#addGiftCardOrPromo_Unknown:not([style*="display:none"]):not([style*="display: none"]),#addGiftCardOrPromo_NoCode:not([style*="display:none"]):not([style*="display: none"]),#addPromo_InvalidForPurchase:not([style*="display:none"]):not([style*="display: none"]),#addPromo_BadCode:not([style*="display:none"]):not([style*="display: none"]),#addPromo_ExpiredCode:not([style*="display:none"]):not([style*="display: none"]),#addPromo_InvalidForOrgUnit:not([style*="display:none"]):not([style*="display: none"]),#addPromo_OfferNotYetBegun:not([style*="display:none"]):not([style*="display: none"]),#addPromo_AlreadyRedeemed:not([style*="display:none"]):not([style*="display: none"]),#addGiftCard_AlreadyRedeemedByAnotherAccount:not([style*="display:none"]):not([style*="display: none"]),#addGiftCard_AlreadyRedeemedByThisAccount:not([style*="display:none"]):not([style*="display: none"]),#addGiftCard_BadCode:not([style*="display:none"]):not([style*="display: none"]),#addGiftCard_ExpiredCode:not([style*="display:none"]):not([style*="display: none"]),#addGiftCard_Cancelled:not([style*="display:none"]):not([style*="display: none"]),#addGiftCard_WrongOrgUnit:not([style*="display:none"]):not([style*="display: none"]),#addGiftCard_ServiceDown:not([style*="display:none"]):not([style*="display: none"]),#addGiftCard_Disabled:not([style*="display:none"]):not([style*="display: none"]),#addGiftCard_Teen_Disabled:not([style*="display:none"]):not([style*="display: none"])')).filter(function(e){return e.hasAttribute("style")})[0];
                                    var isErrorHidden = function(htmlElement){
                                        return (!htmlElement || !!htmlElement.hidden || !htmlElement.hasAttribute("style") || htmlElement.style.display === "none" || !htmlElement.style.display.length);
                                    };
                                    var isSuccessHidden = function(htmlElement){
                                        return !!htmlElement.hidden || (!!txtSuccess && !!txtSuccess.classList && !!txtSuccess.classList.length && Array.from(txtSuccess.classList).indexOf("hidden") !== -1)
                                    };
                                    if (isSuccessHidden(txtSuccess) && isErrorHidden(txtError)) {
                                        timeoutFunction();
                                    } else if (!isErrorHidden(txtError)) {
                                        reject(txtError.innerText.trim());
                                    } else if (!isSuccessHidden(txtSuccess)) {
                                        resolve(txtSuccess.innerText.trim());
                                    } else if (!!txtSuccess && !!txtSuccess.innerText) {
                                        resolve(txtSuccess.innerText.trim());
                                    }
                                }
                            }, 1000);
                        };
                        timeoutFunction();
                    });
                })
                .then(function(result){
                    var gcSuccess = Object.assign(giftCard, {
                        applyResult: result
                    });
                    return successfulGiftCards.push(gcSuccess);
                })
                .catch(function(errorResult){
                    var gcFailed = Object.assign(giftCard, {
                        applyResult: errorResult
                    });
                    return failedGiftCards.push(gcFailed);
                });
        }, Promise.resolve())
        .then(function(){
            return new Promise(function(resolve, reject){
                var browserMessage = {
                    paymentPayloadId: paymentPayloadId,
                    message: "MOON_NOTIFY_PAYMENT_COMPLETION",
                    amazonSuccessfulGiftCards: successfulGiftCards,
                    amazonFailedGiftCards: failedGiftCards
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
})(${JSON.stringify(amazonGiftCards)}, '${environment}', "${paymentPayloadId}");
`, {compress: true, mangle: true});

export default generateAmazonPaymentPayload;
