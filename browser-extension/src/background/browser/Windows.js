/*
 * Copyright (c) 2018 moon
 */

import {tabDidUpdate} from "../windowManager";
import backgroundLogger from "../utils/BackgroundLogger";

/**
 * Interface for interaction with the browser's windows API
 */
class Windows {
    /**
     * Creates a new window with
     * its specified {@param url}
     * @param height (default: natural) - of the popup window
     * @param width (default: natural) - of the popup window
     * @param type (default: normal)
     *
     * @see {@link https://developer.chrome.com/extensions/windows#method-create}
     */
    static create = ({url, height, width, type}) => new Promise((resolve, reject) => {
        if (process.env.BROWSER === "firefox") {
            const creating = browser.windows.create({
                url,
                type,
                height,
                width
            });
            creating.then(data=> {
                resolve(data);
            }).catch(err => {
                reject(err);
            });
        } else if (process.env.BROWSER === "chrome") {
            chrome.windows.create({
                url,
                focused: true,
                type,
                height,
                width
            }, window => {
                const lastError = chrome.runtime.lastError;
                if (!!lastError) {
                    backgroundLogger.error(lastError);
                    reject(lastError);
                } else {
                    resolve(window);
                }
            });
        }
    });

    /**
     * Initializer script to be "run" when the script starts
     */
    static run() {
        /**
         * Fired when the currently focused window changes.
         * @see {@link https://developer.chrome.com/extensions/windows#event-onFocusChanged}
         */
        if (process.env.BROWSER === "firefox") {
            browser.windows.onFocusChanged.addListener(() =>
                browser.tabs.query({
                    active: true,
                    currentWindow: true
                }).then(tabs => tabDidUpdate(tabs[0]))
            );
        } else if (process.env.BROWSER === "chrome"){
            chrome.windows.onFocusChanged.addListener(() =>
                chrome.tabs.query({
                    active: true,
                    currentWindow: true
                }, tabs => tabDidUpdate(tabs[0]))
            );
        }
    }
}

export default Windows;
