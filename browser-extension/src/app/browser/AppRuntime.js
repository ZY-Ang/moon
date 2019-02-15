/*
 * Copyright (c) 2018 moon
 */

import Runtime from "../../browser/Runtime";
import messageCenter from "../messageCenter";
import {REQUEST_UPDATE_AUTH_USER} from "../../constants/events/appEvents";
import store from "../redux/store";
import {ACTION_SET_APP_MODAL_LOADING_STATE} from "../redux/reducers/constants";

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

        if (process.env.BROWSER === "firefox") {
            if (browser && browser.runtime) {
                const sending = browser.runtime.sendMessage(message);
                sending.then(response => {
                    if (browser.runtime.lastError) {
                        reject(browser.runtime.lastError);
                    } else if (response.success) {
                        resolve(response.response);
                    } else {
                        reject(response);
                    }
                });

            } else if (chrome && chrome.runtime) {
                resolve(chrome.runtime.sendMessage(message));
            }
        } else {
            if (chrome && chrome.runtime) {
                chrome.runtime.sendMessage(message, response => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else if (response.success) {
                        resolve(response.response);
                    } else {
                        reject(response);
                    }
                });

            } else if (browser && browser.runtime) {
                resolve(browser.runtime.sendMessage(message));
            }
        }
    });

    /**
     * Initializer script to be "run" when the script starts
     */
    static run = () => {
        if (process.env.BROWSER === "firefox") {
            if (browser && browser.runtime) {
                /**
                 * Fired when the content script receives a new message.
                 *
                 * Note: Code looks the same for both content and background scripts.
                 *
                 * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage#addListener_syntax}
                 */
                browser.runtime.onMessage.addListener(messageCenter);
            } else if (chrome && chrome.runtime) {
                /**
                 * Fired when the content script receives a new message.
                 *
                 * Note: Code looks the same for both content and background scripts.
                 *
                 * @see {@link https://developer.chrome.com/extensions/runtime#event-onMessage}
                 */
                chrome.runtime.onMessage.addListener(messageCenter);
            }
        } else {
            if (chrome && chrome.runtime) {
                /**
                 * Fired when the content script receives a new message.
                 *
                 * Note: Code looks the same for both content and background scripts.
                 *
                 * @see {@link https://developer.chrome.com/extensions/runtime#event-onMessage}
                 */
                chrome.runtime.onMessage.addListener(messageCenter);
            } else if (browser && browser.runtime) {
                /**
                 * Fired when the content script receives a new message.
                 *
                 * Note: Code looks the same for both content and background scripts.
                 *
                 * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage#addListener_syntax}
                 */
                browser.runtime.onMessage.addListener(messageCenter);
            }
        }

        // Poll background script for latest AuthUser
        store.dispatch({
            type: ACTION_SET_APP_MODAL_LOADING_STATE,
            isActive: true,
            text: "Loading..."
        });
        AppRuntime.sendMessage(REQUEST_UPDATE_AUTH_USER)
            .finally(() => store.dispatch({
                type: ACTION_SET_APP_MODAL_LOADING_STATE,
                isActive: false
            }));
    }
}

export default AppRuntime;
