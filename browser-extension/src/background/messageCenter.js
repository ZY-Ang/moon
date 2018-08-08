/*
 * Copyright (c) 2018 moon
 */

import {REQUEST_GLOBAL_SIGN_OUT, REQUEST_LAUNCH_WEB_AUTH_FLOW, REQUEST_SIGN_OUT} from "../constants/events/app";
import {doGlobalSignOut, doLaunchWebAuthFlow, doSignOut} from "./auth";
import BackgroundRuntime from "./browser/BackgroundRuntime";
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
    if (sender.id !== BackgroundRuntime.id) {
        sendFailure(`${sender.id} is unauthorized`);
        return;
    }
    switch (request.message) {
        case REQUEST_LAUNCH_WEB_AUTH_FLOW:
            doLaunchWebAuthFlow(request.type)
                .then(() => sendSuccess(`doLaunchWebAuthFlow(${request.type}) completed`))
                .catch(() => sendFailure(`doLaunchWebAuthFlow(${request.type}) failed`));
            return true;
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
