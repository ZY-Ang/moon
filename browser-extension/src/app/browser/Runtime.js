/*
 * Copyright (c) 2018 moon
 */

import SuperRuntime from "../../browser/Runtime";
import messageCenter from "../messageCenter";

/**
 * Utility Class for interaction with the browser's runtime API
 */
class Runtime extends SuperRuntime {
    /**
     * Sends a {@param message {object}} to the background script.
     *
     * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/sendMessage}
     */
    static sendMessage = (message) => new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, response => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(response);
            }
        })
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

export default Runtime;
