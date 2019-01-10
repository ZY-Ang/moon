/*
 * Copyright (c) 2018 moon
 */

import {
    POLL_IS_COINBASE_AUTH_MODE,
    REQUEST_GET_EXCHANGE_RATE,
    REQUEST_GET_EXCHANGE_RATES,
    REQUEST_GET_ID_JWTOKEN,
    REQUEST_GET_PAYMENT_PAYLOAD,
    REQUEST_GET_SITE_INFORMATION,
    REQUEST_GLOBAL_SIGN_OUT,
    REQUEST_LAUNCH_COINBASE_AUTH_FLOW,
    REQUEST_LAUNCH_WEB_AUTH_FLOW,
    REQUEST_MOON_SITE_SUPPORT,
    REQUEST_MOON_VALID_CHECKOUT_REPORT,
    REQUEST_NOTIFY_PAYMENT_PAYLOAD_COMPLETION,
    REQUEST_RESET_PASSWORD,
    REQUEST_SIGN_OUT,
    REQUEST_TEST_FUNCTION,
    REQUEST_UPDATE_AUTH_USER,
    REQUEST_UPDATE_COINBASE_API_KEYS,
    REQUEST_UPDATE_ONBOARDING_SKIP,
    REQUEST_OPEN_POPUP
} from "../constants/events/appEvents";
import {doGlobalSignOut, doLaunchWebAuthFlow, doSignOut, doUpdateAuthUserEvent} from "./auth/index";
import BackgroundRuntime from "./browser/BackgroundRuntime";
import {getSendFailureResponseFunction, getSendSuccessResponseFunction} from "../browser/utils";
import moonTestFunction from "./moonTestFunction";
import store from "./redux/store";
import {doLaunchCoinbaseAuthFlow, doUpdateCoinbaseApiKeyEvent} from "./services/coinbase";
import AuthUser from "./auth/AuthUser";
import {doGetPaymentPayload, updateOnboardingSkipExpiry} from "./api/user";
import {doPasswordReset} from "./auth";
import Tabs from "./browser/Tabs";
import {REQUEST_PAYMENT_COMPLETED_OFF_MODAL} from "../constants/events/backgroundEvents";
import {getExchangeRate, getExchangeRates} from "./api/exchangeRates";
import {doAddNonCheckoutReport, doAddSiteSupportRequest, getSiteInformation} from "./api/siteInformation";
import Windows from "../background/browser/Windows";
import {URL_MOON_TAWK_SUPPORT} from "../constants/url";
/**
 * Message handler for receiving messages from other extension processes
 * @param request {object} - message sent by the extension process
 * @param sender {object} - the extension process that sent the message
 * @param sendResponse {function(<object>)} - response callback to notify sender of completion or failure
 *
 * @see {@link https://developer.chrome.com/extensions/runtime#event-onMessage}
 */
const messageCenter = (request, sender, sendResponse) => {
    const sendSuccess = getSendSuccessResponseFunction(sendResponse);
    const sendFailure = getSendFailureResponseFunction(sendResponse);
    // Always ensure message extension sender is our own
    if (sender.id !== BackgroundRuntime.id) {
        sendFailure(`sender.id (${sender.id}) is unauthorized`);
        return;
    }
    const messageResolver = {
        [REQUEST_TEST_FUNCTION]() {
            if (process.env.NODE_ENV !== 'production') {
                moonTestFunction(request.params).then(sendSuccess).catch(sendFailure);
                return true;
            }
            sendFailure("You are not authorized to access this experimental feature yet.");
        },
        [REQUEST_GET_ID_JWTOKEN]() {
            if (process.env.NODE_ENV !== 'production') {
                AuthUser.getInstance().getRefreshedIdJWToken()
                    .then(sendSuccess)
                    .catch(err => {
                        logger.error("messageCenter.REQUEST_GET_ID_JWTOKEN exception: ", err);
                        sendFailure(err);
                    });
                return true;
            }
            sendFailure("You are not authorized to access this experimental feature yet.");
        },
        [REQUEST_LAUNCH_WEB_AUTH_FLOW]() {
            doLaunchWebAuthFlow(request.type)
                .then(() => sendSuccess(`doLaunchWebAuthFlow(${request.type}) completed`))
                .catch(err => {
                    logger.error("messageCenter.REQUEST_LAUNCH_WEB_AUTH_FLOW exception: ", err);
                    sendFailure(`doLaunchWebAuthFlow(${request.type}) failed`);
                });
            return true;
        },
        [REQUEST_LAUNCH_COINBASE_AUTH_FLOW]() {
            doLaunchCoinbaseAuthFlow()
                .then(() => sendSuccess(`doLaunchCoinbaseAuthFlow() completed`))
                .catch(err => {
                    logger.error("messageCenter.REQUEST_LAUNCH_COINBASE_AUTH_FLOW exception: ", err);
                    sendFailure(`doLaunchCoinbaseAuthFlow() failed`);
                });
            return true;
        },
        [POLL_IS_COINBASE_AUTH_MODE]() {
            sendSuccess(store.getState().coinbaseState.isCoinbaseAuthFlow);
        },
        [REQUEST_UPDATE_ONBOARDING_SKIP]() {
            updateOnboardingSkipExpiry(request.delay)
                .then(() => doUpdateAuthUserEvent(sender.tab))
                .then(() => sendSuccess(`updateOnboardingSkipExpiry(${request.delay}) skipped`))
                .catch(err => {
                    logger.error("messageCenter.REQUEST_UPDATE_ONBOARDING_SKIP exception: ", err);
                    sendFailure(`updateOnboardingSkipExpiry(${request.delay}) failed`);
                });
            return true;
        },
        [REQUEST_UPDATE_COINBASE_API_KEYS]() {
            doUpdateCoinbaseApiKeyEvent(request.apiKey, request.apiSecret, request.innerHTML, sender.tab)
                .then(() => doUpdateAuthUserEvent(sender.tab));
            sendSuccess("doUpdateCoinbaseApiKeyEvent() started");
        },
        [REQUEST_GET_EXCHANGE_RATE]() {
            getExchangeRate(request.quote, request.base)
                .then(exchangeRate => sendSuccess(exchangeRate))
                .catch(err => {
                    logger.error("messageCenter.REQUEST_GET_EXCHANGE_RATE exception: ", err);
                    sendFailure(`getExchangeRate(${request.quote}, ${request.base}) failed`);
                });
            return true;
        },
        [REQUEST_GET_EXCHANGE_RATES]() {
            getExchangeRates(request.pairs)
                .then(exchangeRates => sendSuccess(exchangeRates))
                .catch(err => {
                    logger.error("messageCenter.REQUEST_GET_EXCHANGE_RATES exception: ", err);
                    sendFailure(`getExchangeRates(${request.pairs}) failed`);
                });
            return true;
        },
        [REQUEST_GET_PAYMENT_PAYLOAD]() {
            doGetPaymentPayload(request)
                .then(({data}) => {
                    const scripts = data.getPaymentPayload.data || [];
                    return scripts.map(script => Tabs.executeScript(sender.tab.id, {code: script}));
                })
                .then(responses => sendSuccess(responses))
                .catch(err => {
                    logger.error("messageCenter.REQUEST_GET_PAYMENT_PAYLOAD exception: ", err);
                    sendFailure(err);
                });
            return true;
        },
        [REQUEST_NOTIFY_PAYMENT_PAYLOAD_COMPLETION]() {
            // FIXME: FIXME: FIXME: FIXME: FIXME: FIXME IMPLEMENT IMPLEMENT - Log to db, pageinfo, etc
            logger.log("Notify payment payload completion request: ", request);
            Tabs.sendMessage(sender.tab.id, REQUEST_PAYMENT_COMPLETED_OFF_MODAL, {isSuccess: true}) // TODO: Only send success if all success or something
                .finally(() => sendSuccess(true));
            return true;
        },
        [REQUEST_GET_SITE_INFORMATION]() {
            getSiteInformation(request.host)
                .then(({data}) => sendSuccess(data.siteInformation))
                .catch(err => {
                    logger.error("messageCenter.REQUEST_GET_SITE_INFORMATION exception: ", err);
                    sendFailure(`getSiteInformation(${request.host}) failed`);
                });
            return true;
        },
        [REQUEST_MOON_SITE_SUPPORT]() {
            doAddSiteSupportRequest(AuthUser.getEmail(), request.host)
                .then(({data}) => sendSuccess(data))
                .catch(err => {
                    logger.error("messageCenter.REQUEST_MOON_SITE_SUPPORT exception: ", err);
                    sendFailure(`doAddSiteSupportRequest(${request.host}) failed`);
                });
            return true;
        },
        [REQUEST_MOON_VALID_CHECKOUT_REPORT]() {
            doAddNonCheckoutReport(request.url, request.content, AuthUser.getEmail())
                .then(({data}) => sendSuccess(data))
                .catch(err => {
                    logger.error("messageCenter.REQUEST_MOON_VALID_CHECKOUT_REPORT exception: ", err);
                    sendFailure(`doAddNonCheckoutReport(${request.url}, LARGE_CONTENT, ${AuthUser.getEmail()}) failed`);
                });
            return true;
        },
        [REQUEST_UPDATE_AUTH_USER]() {
            doUpdateAuthUserEvent(sender.tab)
                .then(() => sendSuccess(`doUpdateAuthUserEvent(...) completed`))
                .catch(err => {
                    logger.error("messageCenter.REQUEST_UPDATE_AUTH_USER exception: ", err);
                    sendFailure(`doUpdateAuthUserEvent(${JSON.stringify(sender.tab)}) failed`);
                });
            return true;
        },
        [REQUEST_RESET_PASSWORD]() {
            doPasswordReset()
                .then(() => sendSuccess(`doPasswordReset() completed`))
                .catch(err => {
                    logger.error("messageCenter.REQUEST_RESET_PASSWORD exception: ", err);
                    sendFailure(`doPasswordReset() failed`);
                });
            return true;
        },
        [REQUEST_SIGN_OUT]() {
            doSignOut()
                .then(() => sendSuccess(`doSignOut() completed`))
                .catch(err => {
                    logger.error("messageCenter.REQUEST_SIGN_OUT exception: ", err);
                    sendFailure(`doSignOut() failed`);
                });
            return true;
        },
        [REQUEST_GLOBAL_SIGN_OUT]() {
            doGlobalSignOut()
                .then(() => sendSuccess(`doGlobalSignOut() completed`))
                .catch(err => {
                    logger.error("messageCenter.REQUEST_GLOBAL_SIGN_OUT exception: ", err);
                    sendFailure(`doGlobalSignOut() failed`);
                });
            return true;
        },
        [REQUEST_OPEN_POPUP]() {
            Windows.openPopup(URL_MOON_TAWK_SUPPORT, 600,400)
                .then(() => sendSuccess(`Windows.openPopup() completed`))
                .catch(err => {
                    logger.error("messageCenter.REQUEST_OPEN_POPUP", err);
                    sendFailure("Windows.openPopup() failed");
                });
            return true;
        }
    };
    if (request.message && request.message in messageResolver) {
        return messageResolver[request.message]();
    } else {
        logger.warn("messageCenter Received an unknown message.\nRequest: ", JSON.stringify(request), "\nSender: ", JSON.stringify(sender));
        sendFailure("Background messageCenter received an unknown request");
    }
};

export default messageCenter;
