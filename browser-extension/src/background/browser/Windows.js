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
    });

    /**
     * Initializer script to be "run" when the script starts
     */
    static run() {
        /**
         * Fired when the currently focused window changes.
         * @see {@link https://developer.chrome.com/extensions/windows#event-onFocusChanged}
         */
        chrome.windows.onFocusChanged.addListener(() =>
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, tabs => tabDidUpdate(tabs[0]))
        );
    }
}

export default Windows;
