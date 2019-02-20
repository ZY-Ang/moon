/*
 * Copyright (c) 2019 moon
 */
import {generate as randomstring} from "randomstring";
import generateAmazonPaymentPayload from "./generateAmazonPaymentPayload";

const getRandomCard = (cardNumber, randString=randomstring(8)) => ({
    cardInfo: {
        cardNumber: null,
        cardStatus: "Fulfilled",
        expirationDate: null,
        value: {
            amount: parseFloat("0.01"),
            currencyCode: "USD"
        }
    },
    gcClaimCode: cardNumber || `${randomstring({length: 4, charset: 'alphanumeric'}).toUpperCase()}-${randomstring({length: 6, charset: 'alphanumeric'}).toUpperCase()}-${randomstring({length: 4, charset: 'alphanumeric'}).toUpperCase()}`,
    gcId: (cardNumber && `TEST-${cardNumber}`) || `TEST${randString}`,
    status: "SUCCESS",
    gcExpirationDate: null
});

test("Payment payload can compile", () => {
    const randomId = randomstring(8);
    const amazonGiftCards = [
        getRandomCard(),
        getRandomCard(),
        getRandomCard()
    ];
    expect(generateAmazonPaymentPayload(amazonGiftCards, "development", randomId)).toEqual(expect.anything());
    expect(generateAmazonPaymentPayload(amazonGiftCards, "production", randomId)).toEqual(expect.anything());
});

test("Payment payload matches snapshot", () => {
    const fixedId = "56781234";
    const amazonGiftCards = [
        getRandomCard("QE48-RDCSQH-2JMG", fixedId)
    ];
    let amazonPaymentPayload = generateAmazonPaymentPayload(amazonGiftCards, "production", fixedId);
    let expectedPayload = "!function(e,n,t){var o=document.querySelectorAll(\".a-button.a-spacing-micro .a-button-i" +
        "nner input,#gcApplyButtonId,.PromoEntryButton input[type='submit']\")[0],r=document.querySelectorAll(\"#sp" +
        "c-gcpromoinput,input[name='code'].PromoEntryField\")[0],s=[],d=[];return e.reduce(function(e,n){return e.t" +
        "hen(function(){return new Promise(function(e,t){r.value=n.gcClaimCode,o.click();var s=function(){setTimeou" +
        "t(function(){var n=document.querySelectorAll(\"#payment .section-overwrap,#loading-spinner-blocker-doc\")[" +
        "0];if(n&&\"none\"!==n.style.display)s();else{var o=document.querySelector(\"#gc-success,#promo-success,.Pr" +
        "omoEntrySuccess\"),r=Array.from(document.querySelectorAll('.PromoEntryError,#addGiftCardOrPromo_Unknown:no" +
        "t([style*=\"display:none\"]):not([style*=\"display: none\"]),#addGiftCardOrPromo_NoCode:not([style*=\"disp" +
        "lay:none\"]):not([style*=\"display: none\"]),#addPromo_InvalidForPurchase:not([style*=\"display:none\"]):n" +
        "ot([style*=\"display: none\"]),#addPromo_BadCode:not([style*=\"display:none\"]):not([style*=\"display: non" +
        "e\"]),#addPromo_ExpiredCode:not([style*=\"display:none\"]):not([style*=\"display: none\"]),#addPromo_Inval" +
        "idForOrgUnit:not([style*=\"display:none\"]):not([style*=\"display: none\"]),#addPromo_OfferNotYetBegun:not" +
        "([style*=\"display:none\"]):not([style*=\"display: none\"]),#addPromo_AlreadyRedeemed:not([style*=\"displa" +
        "y:none\"]):not([style*=\"display: none\"]),#addGiftCard_AlreadyRedeemedByAnotherAccount:not([style*=\"disp" +
        "lay:none\"]):not([style*=\"display: none\"]),#addGiftCard_AlreadyRedeemedByThisAccount:not([style*=\"displ" +
        "ay:none\"]):not([style*=\"display: none\"]),#addGiftCard_BadCode:not([style*=\"display:none\"]):not([style" +
        "*=\"display: none\"]),#addGiftCard_ExpiredCode:not([style*=\"display:none\"]):not([style*=\"display: none\"" +
        "]),#addGiftCard_Cancelled:not([style*=\"display:none\"]):not([style*=\"display: none\"]),#addGiftCard_Wron" +
        "gOrgUnit:not([style*=\"display:none\"]):not([style*=\"display: none\"]),#addGiftCard_ServiceDown:not([styl" +
        "e*=\"display:none\"]):not([style*=\"display: none\"]),#addGiftCard_Disabled:not([style*=\"display:none\"])" +
        ":not([style*=\"display: none\"]),#addGiftCard_Teen_Disabled:not([style*=\"display:none\"]):not([style*=\"d" +
        "isplay: none\"])')).filter(function(e){return e.hasAttribute(\"style\")})[0],d=function(e){return!(e&&!e.h" +
        "idden&&e.hasAttribute(\"style\")&&\"none\"!==e.style.display&&e.style.display.length)},l=function(e){retur" +
        "n!!e.hidden||!!o&&!!o.classList&&!!o.classList.length&&-1!==Array.from(o.classList).indexOf(\"hidden\")};l" +
        "(o)&&d(r)?s():d(r)?l(o)?o&&o.innerText&&e(o.innerText.trim()):e(o.innerText.trim()):t(r.innerText.trim())}" +
        "},1e3)};s()})}).then(function(e){var t=Object.assign(n,{applyResult:e});return s.push(t)})[\"catch\"](func" +
        "tion(e){var t=Object.assign(n,{applyResult:e});return d.push(t)})},Promise.resolve()).then(function(){retu" +
        "rn new Promise(function(e,o){var r={paymentPayloadId:t,message:\"MOON_NOTIFY_PAYMENT_COMPLETION\",amazonSu" +
        "ccessfulGiftCards:s,amazonFailedGiftCards:d};\"production\"!==n&&console.log(\"browserMessage: \",r),setTi" +
        "meout(function(){chrome&&chrome.runtime?chrome.runtime.sendMessage(r,function(n){chrome.runtime.lastError?" +
        "o(chrome.runtime.lastError):n.success?e(n.response):o(n)}):browser&&browser.runtime&&e(browser.runtime.sen" +
        "dMessage(r))},3e3)})}).then(function(){var e=document.querySelectorAll(\".a-button-text.place-your-order-b" +
        "utton,#submitOrderButtonId,.MusicCartReviewButtonSection input[type='submit']\")[0];e&&e.click()})[\"catch" +
        "\"](function(e){console.error(\"Something seriously bad happened: \",e)})}([{cardInfo:{cardNumber:null,car" +
        "dStatus:\"Fulfilled\",expirationDate:null,value:{amount:.01,currencyCode:\"USD\"}},gcClaimCode:\"QE48-RDCS" +
        "QH-2JMG\",gcId:\"TEST-QE48-RDCSQH-2JMG\",status:\"SUCCESS\",gcExpirationDate:null}],\"production\",\"56781" +
        "234\");";
    expect(amazonPaymentPayload).toBe(expectedPayload);

    amazonPaymentPayload = generateAmazonPaymentPayload(amazonGiftCards, "development", fixedId);
    expectedPayload = "!function(e,n,t){var o=document.querySelectorAll(\".a-button.a-spacing-micro .a-button-inner" +
        " input,#gcApplyButtonId,.PromoEntryButton input[type='submit']\")[0],r=document.querySelectorAll(\"#spc-gc" +
        "promoinput,input[name='code'].PromoEntryField\")[0],s=[],d=[];return e.reduce(function(e,n){return e.then(" +
        "function(){return new Promise(function(e,t){r.value=n.gcClaimCode,o.click();var s=function(){setTimeout(fu" +
        "nction(){var n=document.querySelectorAll(\"#payment .section-overwrap,#loading-spinner-blocker-doc\")[0];i" +
        "f(n&&\"none\"!==n.style.display)s();else{var o=document.querySelector(\"#gc-success,#promo-success,.PromoE" +
        "ntrySuccess\"),r=Array.from(document.querySelectorAll('.PromoEntryError,#addGiftCardOrPromo_Unknown:not([s" +
        "tyle*=\"display:none\"]):not([style*=\"display: none\"]),#addGiftCardOrPromo_NoCode:not([style*=\"display:" +
        "none\"]):not([style*=\"display: none\"]),#addPromo_InvalidForPurchase:not([style*=\"display:none\"]):not([" +
        "style*=\"display: none\"]),#addPromo_BadCode:not([style*=\"display:none\"]):not([style*=\"display: none\"]" +
        "),#addPromo_ExpiredCode:not([style*=\"display:none\"]):not([style*=\"display: none\"]),#addPromo_InvalidFo" +
        "rOrgUnit:not([style*=\"display:none\"]):not([style*=\"display: none\"]),#addPromo_OfferNotYetBegun:not([st" +
        "yle*=\"display:none\"]):not([style*=\"display: none\"]),#addPromo_AlreadyRedeemed:not([style*=\"display:no" +
        "ne\"]):not([style*=\"display: none\"]),#addGiftCard_AlreadyRedeemedByAnotherAccount:not([style*=\"display:" +
        "none\"]):not([style*=\"display: none\"]),#addGiftCard_AlreadyRedeemedByThisAccount:not([style*=\"display:n" +
        "one\"]):not([style*=\"display: none\"]),#addGiftCard_BadCode:not([style*=\"display:none\"]):not([style*=\"" +
        "display: none\"]),#addGiftCard_ExpiredCode:not([style*=\"display:none\"]):not([style*=\"display: none\"])," +
        "#addGiftCard_Cancelled:not([style*=\"display:none\"]):not([style*=\"display: none\"]),#addGiftCard_WrongOr" +
        "gUnit:not([style*=\"display:none\"]):not([style*=\"display: none\"]),#addGiftCard_ServiceDown:not([style*=" +
        "\"display:none\"]):not([style*=\"display: none\"]),#addGiftCard_Disabled:not([style*=\"display:none\"]):no" +
        "t([style*=\"display: none\"]),#addGiftCard_Teen_Disabled:not([style*=\"display:none\"]):not([style*=\"disp" +
        "lay: none\"])')).filter(function(e){return e.hasAttribute(\"style\")})[0],d=function(e){return!(e&&!e.hidd" +
        "en&&e.hasAttribute(\"style\")&&\"none\"!==e.style.display&&e.style.display.length)},l=function(e){return!!" +
        "e.hidden||!!o&&!!o.classList&&!!o.classList.length&&-1!==Array.from(o.classList).indexOf(\"hidden\")};l(o)" +
        "&&d(r)?s():d(r)?l(o)?o&&o.innerText&&e(o.innerText.trim()):e(o.innerText.trim()):t(r.innerText.trim())}},1" +
        "e3)};s()})}).then(function(e){var t=Object.assign(n,{applyResult:e});return s.push(t)})[\"catch\"](functio" +
        "n(e){var t=Object.assign(n,{applyResult:e});return d.push(t)})},Promise.resolve()).then(function(){return " +
        "new Promise(function(e,o){var r={paymentPayloadId:t,message:\"MOON_NOTIFY_PAYMENT_COMPLETION\",amazonSucce" +
        "ssfulGiftCards:s,amazonFailedGiftCards:d};\"production\"!==n&&console.log(\"browserMessage: \",r),setTimeo" +
        "ut(function(){chrome&&chrome.runtime?chrome.runtime.sendMessage(r,function(n){chrome.runtime.lastError?o(c" +
        "hrome.runtime.lastError):n.success?e(n.response):o(n)}):browser&&browser.runtime&&e(browser.runtime.sendMe" +
        "ssage(r))},3e3)})}).then(function(){var e=document.querySelectorAll(\".a-button-text.place-your-order-butt" +
        "on,#submitOrderButtonId,.MusicCartReviewButtonSection input[type='submit']\")[0];e&&e.click()})[\"catch\"]" +
        "(function(e){console.error(\"Something seriously bad happened: \",e)})}([{cardInfo:{cardNumber:null,cardSt" +
        "atus:\"Fulfilled\",expirationDate:null,value:{amount:.01,currencyCode:\"USD\"}},gcClaimCode:\"QE48-RDCSQH-" +
        "2JMG\",gcId:\"TEST-QE48-RDCSQH-2JMG\",status:\"SUCCESS\",gcExpirationDate:null}],\"development\",\"5678123" +
        "4\");";
    expect(amazonPaymentPayload).toBe(expectedPayload);
});
