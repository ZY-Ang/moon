/*
 * Copyright (c) 2018 moon
 */

import {tabDidUpdate} from "../windowManager";
import backgroundLogger from "../utils/BackgroundLogger";

/**
 * Interface for interaction with the browser's tabs API
 * @class
 */
class Tabs {
    /**
     * Sends a {@param request {request}} to the specified {@param tabId}.
     * Requests for {@method Tabs.sendMessage} can be found
     * in the shared events constants directory
     * {@link ~/src/constants/events/backgroundEvents.js}
     *
     * @param options {object} - additional parameters to be passed into the request.
     *
     * @see {@link https://developer.chrome.com/extensions/runtime#method-sendMessage}
     */
    static sendMessage = (tabId, request, options) => new Promise((resolve, reject) => {
        const message = {
            ...(options || {}),
            message: request
        };

        if (process.env.BROWSER === "firefox") {
            // newline
            const sending = browser.tabs.sendMessage(
                tabId,
                message,
                null
            );
            sending.then(response => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else if (response.success) {
                    resolve(response.response);
                } else {
                    reject(response);
                }
            });
            //     resolve(response.response);
            // }, err => {
            //     reject(err);
            // });
            // endl
        } else {
            chrome.tabs.sendMessage(tabId, message, null, response => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else if (response.success) {
                    resolve(response.response);
                } else {
                    reject(response);
                }
            });
        }
    });

    /**
     * Sends a {@param message} to the active
     * tab in the current window
     *
     * @param options {object} - additional parameters to be passed into the request.
     */
    static sendMessageToActive = (message, options) =>
        Tabs.getActive()
            .then(tab => {
                if (!!tab) {
                    return Tabs.sendMessage(tab.id, message, options)
                        .catch(() => backgroundLogger.log(`Receiving end probably does not exist.`));
                }
                // Otherwise, page is not ready.
            });

    /**
     * Sends a {@param message} to all tabs.
     *
     * @param options {object} - additional parameters to be passed into the request.
     */
    static sendMessageToAll = (message, options) =>
        Tabs.getAll()
            .then(tabs => tabs.filter(tab => (!!tab)))
            .then(tabs => tabs.forEach(tab =>
                Tabs.sendMessage(tab.id, message, options)
                    .catch(() => backgroundLogger.log(`Message broadcast: Skipping ${tab.id}. Receiving end probably does not exist.`))
            ));

    /**
     * Injects scripts and css onto a page
     * @param tabId - of the tab where the page is on
     * @param details - of the injection
     * @return {Promise<array<results>>}
     *
     * @see {@link https://developer.chrome.com/extensions/tabs#method-executeScript}
     */
    static executeScript = (tabId, details) => new Promise((resolve, reject) => {
        if (process.env.BROWSER === 'firefox') {
            const executing = browser.tabs.executeScript({
                tabId,
                details
            });
            executing.then(results => {
                resolve(results);
            }, err => {
                reject(err);
            });
        } else {
            chrome.tabs.executeScript(tabId, details, results => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(results);
                }
            });
        }
    });

    /**
     * Updates a tab of {@param tabId}
     * with new {@param updateProperties}
     */
    static update = (tabId, updateProperties) => new Promise((resolve, reject) => {
        if (process.env.BROWSER === 'firefox') {
            const updating = browser.tabs.update({
                tabId,
                updateProperties
            });
            updating.then(tab => {
                resolve(tab);
            }, err => {
                reject(err);
            });
        } else {
            chrome.tabs.update(tabId, updateProperties, tab => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(tab);
                }
            });
        }
    });

    /**
     * Gets the active tab in the current window.
     *
     * @see {@link https://developer.chrome.com/extensions/tabs#method-query}
     */
    static getActive = () => new Promise(resolve => {
        if (process.env.BROWSER === 'firefox') {
            browser.tabs.query({
                active: true,
                currentWindow: true
            }).then(tabs => {
                if (!!tabs && tabs.length === 1) {
                    resolve(tabs[0]);
                } else {
                    backgroundLogger.log("Unable to get active tab");
                    resolve(null);
                }
            });
        } else {
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, tabs => {
                if (!!tabs && tabs.length === 1) {
                    resolve(tabs[0]);
                } else {
                    backgroundLogger.log("Unable to get active tab");
                    resolve(null);
                }
            });
        }
    });

    /**
     * Gets all Tabs.
     *
     * @see {@link https://developer.chrome.com/extensions/tabs#method-query}
     */
    static getAll = () => new Promise((resolve) => {
        if (process.env.BROWSER === 'firefox') {
            const querying = browser.tabs.query({});
            querying.then(tabs => resolve(tabs));
        } else {
            chrome.tabs.query({}, tabs => resolve(tabs));
        }
    });

    /**
     * Removes (closes) a {@param tab}
     *
     * @see {@link https://developer.chrome.com/extensions/tabs#method-remove}
     */
    static remove = (tab) => Tabs.removeById(tab.id);

    /**
     * Removes (closes) a tab using its {@param tabId {number}}
     *
     * @see {@link https://developer.chrome.com/extensions/tabs#method-remove}
     */
    static removeById = (tabId) => new Promise((resolve, reject) => {
        if (process.env.BROWSER === 'firefox') {
            const removing = browser.tabs.remove(tabId);
            removing.then(() => {
                if (browser.runtime.lastError) {
                    reject(browser.runtime.lastError);
                } else {
                    resolve(`Tab ${tabId} removed`);
                }
            });
        } else {
            chrome.tabs.remove(tabId, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(`Tab ${tabId} removed`);
                }
            })
        }
    });

    /**
     * Initializer script to be "run" when the script starts
     */
    static run() {
        if (process.env.BROWSER === 'firefox') {
            /**
             * Fired when a tab is updated.
             * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onUpdated}
             */
            browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
                if (changeInfo.status === "complete") {
                    tabDidUpdate(tab);
                }
            });

            /**
             * Fired when the active tab is changed in a window.
             * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onActivated}
             */
            browser.tabs.onActivated.addListener(activeInfo =>
                browser.tabs.get(activeInfo.tabId, (tab) => tabDidUpdate(tab))
            );
        } else {
            /**
             * Fired when a tab is updated.
             * @see {@link https://developer.chrome.com/extensions/tabs#event-onUpdated}
             */
            chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
                if (changeInfo.status === "complete") {
                    tabDidUpdate(tab);
                }
            });

            /**
             * Fired when the active tab is changed in a window.
             * @see {@link https://developer.chrome.com/extensions/tabs#event-onActivated}
             */
            chrome.tabs.onActivated.addListener(activeInfo =>
                chrome.tabs.get(activeInfo.tabId, (tab) => tabDidUpdate(tab))
            );
        }
    }
}

export default Tabs;
