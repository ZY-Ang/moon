/*
 * Copyright (c) 2018 moon
 */

import Runtime from "../../browser/Runtime";
import messageCenter from "../messageCenter";

/**
 * Utility Class for interaction with the browser's runtime API
 * @class
 */
class AppRuntime extends Runtime {
    /**
     * Sends a {@param request {request}} to the background script.
     * Requests for {@method AppRuntime.sendMessage} can be found
     * in the shared events constants directory
     * {@link ~/src/constants/events/appEvents.js}
     *
     * @param options {object} - additional parameters to be passed into the request.
     *
     * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/sendMessage}
     */
    static sendMessage = (request, options) => new Promise((resolve, reject) => {
        const message = {
            ...options,
            message: request
        };

        chrome.runtime.sendMessage(message, response => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else if (response.success) {
                resolve(response.response);
            } else {
                reject(response);
            }
        });
    });

    /**
     * Initializer script to be "run" when the script starts
     */
    static run = () => {
        /**
         * Fired when the content script receives a new message.
         *
         * Note: Code looks the same for both content and background scripts.
         *
         * @see {@link https://developer.chrome.com/extensions/runtime#event-onMessage}
         */
        chrome.runtime.onMessage.addListener(messageCenter);
    }
}

export default AppRuntime;
