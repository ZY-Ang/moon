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
    // Always ensure message extension sender is our own
    if (sender.id !== BackgroundRuntime.id) {
        return;
    }
    const sendSuccess = getSendSuccessResponseFunction(sendResponse);
    const sendFailure = getSendFailureResponseFunction(sendResponse);
    switch (request.message) {
        case REQUEST_LAUNCH_WEB_AUTH_FLOW:
            return !!doLaunchWebAuthFlow(request.type)
                .then(() => sendSuccess(`doLaunchWebAuthFlow(${request.type}) completed`))
                .catch(() => sendFailure(`doLaunchWebAuthFlow(${request.type}) failed`));
        case REQUEST_SIGN_OUT:
            return !!doSignOut()
                .then(() => sendSuccess(`doSignOut() completed`))
                .catch(() => sendFailure(`doSignOut() failed`));
        case REQUEST_GLOBAL_SIGN_OUT:
            return !!doGlobalSignOut()
                .then(() => sendSuccess(`doGlobalSignOut() completed`))
                .catch(() => sendFailure(`doGlobalSignOut() failed`));
        default:
            console.warn("Received an unknown message.\nRequest: ", request, "\nSender: ", sender);
            sendFailure("Background messageCenter received an unknown request");
            break;
    }
};

export default messageCenter;
