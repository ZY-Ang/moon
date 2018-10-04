/*
 * Copyright (c) 2018 moon
 */

import {
    POLL_IS_COINBASE_AUTH_MODE, REQUEST_GET_ID_JWTOKEN, REQUEST_GET_PAYMENT_PAYLOAD, REQUEST_GET_SITE_INFORMATION,
    REQUEST_GLOBAL_SIGN_OUT, REQUEST_LAUNCH_COINBASE_AUTH_FLOW,
    REQUEST_LAUNCH_WEB_AUTH_FLOW, REQUEST_MOON_SITE_SUPPORT, REQUEST_RESET_PASSWORD,
    REQUEST_SIGN_OUT,
    REQUEST_TEST_FUNCTION, REQUEST_UPDATE_COINBASE_API_KEYS
} from "../constants/events/appEvents";
import {doGlobalSignOut, doLaunchWebAuthFlow, doSignOut} from "./auth/index";
import BackgroundRuntime from "./browser/BackgroundRuntime";
import {getSendFailureResponseFunction, getSendSuccessResponseFunction} from "../browser/utils";
import moonTestFunction from "./moonTestFunction";
import store from "./redux/store";
import {doLaunchCoinbaseAuthFlow, doUpdateCoinbaseApiKey} from "./services/coinbase";
import AuthUser from "./auth/AuthUser";
import {doAddSiteSupportRequest, doGetPaymentPayload, getSiteInformation} from "./services/moon";
import {doPasswordReset} from "./auth";

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
        sendFailure(`${sender.id} is unauthorized`);
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
                AuthUser.getInstance().getRefreshedIdJWToken().then(sendSuccess).catch(sendFailure);
                return true;
            }
            sendFailure("You are not authorized to access this experimental feature yet.");
        },
        [REQUEST_LAUNCH_WEB_AUTH_FLOW]() {
            doLaunchWebAuthFlow(request.type)
                .then(() => sendSuccess(`doLaunchWebAuthFlow(${request.type}) completed`))
                .catch(() => sendFailure(`doLaunchWebAuthFlow(${request.type}) failed`));
            return true;
        },
        [REQUEST_LAUNCH_COINBASE_AUTH_FLOW]() {
            doLaunchCoinbaseAuthFlow()
                .then(() => sendSuccess(`doLaunchCoinbaseAuthFlow() completed`))
                .catch(() => sendFailure(`doLaunchCoinbaseAuthFlow() failed`));
            return true;
        },
        [POLL_IS_COINBASE_AUTH_MODE]() {
            sendSuccess(store.getState().coinbaseState.isCoinbaseAuthFlow);
        },
        [REQUEST_UPDATE_COINBASE_API_KEYS]() {
            doUpdateCoinbaseApiKey(request.apiKey, request.apiSecret, request.innerHTML, sender.tab);
            sendSuccess("doUpdateCoinbaseApiKey() started");
        },
        [REQUEST_GET_PAYMENT_PAYLOAD]() {
            doGetPaymentPayload(request)
                .then(({data}) => sendSuccess(data))
                .catch(() => sendFailure(`doGetPaymentPayload() failed`));
            return true;
        },
        [REQUEST_GET_SITE_INFORMATION]() {
            getSiteInformation(request.host)
                .then(({data}) => sendSuccess(data))
                .catch(() => sendFailure(`getSiteInformation(${request.host}) failed`));
            return true;
        },
        [REQUEST_MOON_SITE_SUPPORT]() {
            doAddSiteSupportRequest(request.host)
                .then(({data}) => sendSuccess(data))
                .catch(() => sendFailure(`doAddSiteSupportRequest(${request.host}) failed`))
            return true;
        },
        [REQUEST_RESET_PASSWORD]() {
            doPasswordReset()
                .then(() => sendSuccess(`doPasswordReset() completed`))
                .catch(() => sendFailure(`doPasswordReset() failed`));
            return true;
        },
        [REQUEST_SIGN_OUT]() {
            doSignOut()
                .then(() => sendSuccess(`doSignOut() completed`))
                .catch(() => sendFailure(`doSignOut() failed`));
            return true;
        },
        [REQUEST_GLOBAL_SIGN_OUT]() {
            doGlobalSignOut()
                .then(() => sendSuccess(`doGlobalSignOut() completed`))
                .catch(() => sendFailure(`doGlobalSignOut() failed`));
            return true;
        }
    };
    if (request.message && request.message in messageResolver) {
        return messageResolver[request.message]();
    } else {
        console.warn("Received an unknown message.\nRequest: ", request, "\nSender: ", sender);
        sendFailure("Background messageCenter received an unknown request");
    }
};

export default messageCenter;
