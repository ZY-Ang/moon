/*
 * Copyright (c) 2018 moon
 */

import {
    REQUEST_COINBASE_EXTRACT_API_KEYS,
    REQUEST_INJECT_APP,
    REQUEST_UPDATE_AUTH_USER
} from "../constants/events/backgroundEvents";
import {toggleApp} from "./index";
import AppRuntime from "./browser/AppRuntime";
import {getSendFailureResponseFunction, getSendSuccessResponseFunction} from "../browser/utils";
import {doExtractCoinbaseApiKeys} from "./wallets/coinbase";
import {updateAuthUser} from "./utils/auth";

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
    if (sender.id !== AppRuntime.id) {
        sendFailure(`${sender.id} is unauthorized`);
        return;
    }
    const messageResolver = {
        [REQUEST_INJECT_APP]() {
            toggleApp(request.source)
                .then(() => sendSuccess(`toggleApp(${request.source}) completed`))
                .catch(() => sendFailure(`toggleApp(${request.source}) failed`));
            return true;
        },
        [REQUEST_UPDATE_AUTH_USER]() {
            updateAuthUser(request.authUser)
                .then(() => sendSuccess(`updateAuthUser(${request.authUser}) completed`))
                .catch(() => sendFailure(`updateAuthUser(${request.authUser}) failed`));
            return true;
        },
        [REQUEST_COINBASE_EXTRACT_API_KEYS]() {
            doExtractCoinbaseApiKeys();
            sendSuccess("doExtractCoinbaseApiKeys() started");
        }
    };
    if (request.message && request.message in messageResolver) {
        return messageResolver[request.message]();
    } else {
        console.warn("Received an unknown message.\nRequest: ", request, "\nSender: ", sender);
        sendFailure("App messageCenter received an unknown request");
    }
};

export default messageCenter;
