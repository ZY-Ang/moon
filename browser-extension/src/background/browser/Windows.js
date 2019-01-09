/*
 * Copyright (c) 2018 moon
 */

import {tabDidUpdate} from "../windowManager";

/**
 * Interface for interaction with the browser's windows API
 */
class Windows {
    /**
     * Opens a new popup window with
     * its specified {@param url}
     * @param height (default: natural) - of the popup window
     * @param width (default: natural) - of the popup window
     *
     * @see {@link https://developer.chrome.com/extensions/windows#method-create}
     */
    static openPopup = (url, height, width) => new Promise((resolve, reject) => {
        chrome.windows.create({
            url,
            focused: true,
            type: 'popup',
            height,
            width
        }, window => {
            const lastError = chrome.runtime.lastError;
            if (!!lastError) {
                logger.error(lastError);
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
