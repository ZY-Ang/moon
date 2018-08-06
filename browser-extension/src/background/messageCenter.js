/*
 * Copyright (c) 2018 moon
 */

import {extensionId} from "../constants/extension";
import {REQUEST_GLOBAL_SIGN_OUT, REQUEST_LAUNCH_WEB_AUTH_FLOW, REQUEST_SIGN_OUT} from "../constants/events/app";
import {doGlobalSignOut, doLaunchWebAuthFlow, doSignOut} from "./auth";

/**
 * Message handler for receiving messages from other extension processes
 * @param request {object} - message sent by the extension process
 * @param sender {object} - the extension process that sent the message
 * @param sendResponse {function(<object>)} - response callback to notify sender of completion or failure
 */
const messageCenter = (request, sender, sendResponse) => {
    // Always ensure message extension sender is our own
    if (sender.id !== extensionId) {
        return;
    }
    switch (request.message) {
        case REQUEST_LAUNCH_WEB_AUTH_FLOW:
            doLaunchWebAuthFlow(request.type)
                .then(() => sendResponse(`doLaunchWebAuthFlow(${request.type}) completed`))
                .catch(() => sendResponse(`doLaunchWebAuthFlow(${request.type}) failed`));
            break;
        case REQUEST_SIGN_OUT:
            doSignOut()
                .then(() => sendResponse(`doSignOut() completed`))
                .catch(() => sendResponse(`doSignOut() failed`));
            break;
        case REQUEST_GLOBAL_SIGN_OUT:
            doGlobalSignOut()
                .then(() => sendResponse(`doGlobalSignOut() completed`))
                .catch(() => sendResponse(`doGlobalSignOut() failed`));
            break;
        default:
            console.warn("Received an unknown message.\nRequest: ", request, "\nSender: ", sender);
            break;
    }
};

export default messageCenter;
