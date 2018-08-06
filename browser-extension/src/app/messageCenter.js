/*
 * Copyright (c) 2018 moon
 */

import {REQUEST_INJECT_APP, REQUEST_UPDATE_AUTH_USER} from "../constants/events/background";
import {injectApp, updateAuthUser} from "./index";
import Runtime from "./browser/Runtime";

/**
 * Message handler for receiving messages from other extension processes
 * @param request {object} - message sent by the extension process
 * @param sender {object} - the extension process that sent the message
 * @param sendResponse {function(<object>)} - response callback to notify sender of completion or failure
 */
const messageCenter = (request, sender, sendResponse) => {
    // Always ensure message extension sender is our own
    if (sender.id !== Runtime.id) {
        return;
    }
    const {message, authUser, source} = request;
    switch (message) {
        // If message is injectApp,
        case REQUEST_INJECT_APP:
            // Attempt to inject our app to DOM and send appropriate response
            try {
                injectApp(source);
                sendResponse({success: true});
            } catch (e) {
                sendResponse({error: e});
            }
            break;
        case REQUEST_UPDATE_AUTH_USER:
            try {
                updateAuthUser(authUser);
                sendResponse({success: true});
            } catch (e) {
                sendResponse({error: e});
            }
            break;
        default:
            console.warn("Received an unknown message.\nRequest: ", request, "\nSender: ", sender);
            break;
    }
};

export default messageCenter;
