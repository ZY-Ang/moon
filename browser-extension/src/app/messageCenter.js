/*
 * Copyright (c) 2018 moon
 */

import {
    REQUEST_COINBASE_EXTRACT_API_KEYS,
    REQUEST_INJECT_APP,
    REQUEST_UPDATE_AUTH_USER
} from "../constants/events/backgroundEvents";
import {doExtractCoinbaseApiKeys, toggleApp, updateAuthUser} from "./index";
import AppRuntime from "./browser/AppRuntime";
import {getSendFailureResponseFunction, getSendSuccessResponseFunction} from "../browser/utils";

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
    switch (request.message) {
        case REQUEST_INJECT_APP:
            toggleApp(request.source)
                .then(() => sendSuccess(`toggleApp(${request.source}) completed`))
                .catch(() => sendFailure(`toggleApp(${request.source}) failed`));
            return true;
        case REQUEST_UPDATE_AUTH_USER:
            updateAuthUser(request.authUser)
                .then(() => sendSuccess(`updateAuthUser(${request.authUser}) completed`))
                .catch(() => sendFailure(`updateAuthUser(${request.authUser}) failed`));
            return true;
        case REQUEST_COINBASE_EXTRACT_API_KEYS:
            doExtractCoinbaseApiKeys();
            sendSuccess("doExtractCoinbaseApiKeys() started");
            return;
        default:
            console.warn("Received an unknown message.\nRequest: ", request, "\nSender: ", sender);
            sendFailure("App messageCenter received an unknown request");
            break;
    }
};

export default messageCenter;
