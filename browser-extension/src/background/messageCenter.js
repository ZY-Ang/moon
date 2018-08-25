/*
 * Copyright (c) 2018 moon
 */

import {
    POLL_IS_COINBASE_AUTH_MODE,
    REQUEST_GLOBAL_SIGN_OUT, REQUEST_LAUNCH_COINBASE_AUTH_FLOW,
    REQUEST_LAUNCH_WEB_AUTH_FLOW,
    REQUEST_SIGN_OUT,
    REQUEST_TEST_FUNCTION, REQUEST_UPDATE_COINBASE_API_KEYS
} from "../constants/events/appEvents";
import {doGlobalSignOut, doLaunchWebAuthFlow, doSignOut} from "./auth/index";
import BackgroundRuntime from "./browser/BackgroundRuntime";
import {getSendFailureResponseFunction, getSendSuccessResponseFunction} from "../browser/utils";
import moonTestFunction from "./moonTestFunction";
import store from "./redux/store";
import {doLaunchCoinbaseAuthFlow, doUpdateCoinbaseApiKey} from "./services/coinbase";

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
    switch (request.message) {
        case REQUEST_TEST_FUNCTION:
            if (process.env.BUILD_ENV !== 'production') {
                moonTestFunction(request.params)
                    .then(res => sendSuccess(res))
                    .catch(err => sendFailure(err));
                return true;
            }
            sendFailure("You are not authorized to access this experimental feature yet.");
            break;
        case REQUEST_LAUNCH_WEB_AUTH_FLOW:
            doLaunchWebAuthFlow(request.type)
                .then(() => sendSuccess(`doLaunchWebAuthFlow(${request.type}) completed`))
                .catch(() => sendFailure(`doLaunchWebAuthFlow(${request.type}) failed`));
            return true;
        case REQUEST_LAUNCH_COINBASE_AUTH_FLOW:
            doLaunchCoinbaseAuthFlow()
                .then(() => sendSuccess(`doLaunchCoinbaseAuthFlow() completed`))
                .catch(() => sendFailure(`doLaunchCoinbaseAuthFlow() failed`));
            return true;
        case POLL_IS_COINBASE_AUTH_MODE:
            sendSuccess(store.getState().coinbaseState.isCoinbaseAuthFlow);
            return;
        case REQUEST_UPDATE_COINBASE_API_KEYS:
            doUpdateCoinbaseApiKey(request.apiKey, request.apiSecret, request.innerText, sender.tab);
            sendSuccess("doUpdateCoinbaseApiKey() started");
            return;
        case REQUEST_SIGN_OUT:
            doSignOut()
                .then(() => sendSuccess(`doSignOut() completed`))
                .catch(() => sendFailure(`doSignOut() failed`));
            return true;
        case REQUEST_GLOBAL_SIGN_OUT:
            doGlobalSignOut()
                .then(() => sendSuccess(`doGlobalSignOut() completed`))
                .catch(() => sendFailure(`doGlobalSignOut() failed`));
            return true;
        default:
            console.warn("Received an unknown message.\nRequest: ", request, "\nSender: ", sender);
            sendFailure("Background messageCenter received an unknown request");
            break;
    }
};

export default messageCenter;
