/*
 * Copyright (c) 2018 moon
 */

import {tabDidUpdate} from "../windowManager";
import {isValidWebUrl} from "../../utils/url";

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
            ...options,
            message: request
        };

        chrome.tabs.sendMessage(tabId, message, null, response => {
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
     * Sends a {@param message} to the active
     * tab in the current window
     *
     * @param options {object} - additional parameters to be passed into the request.
     */
    static sendMessageToActive = (message, options) =>
        Tabs.getActive()
            .then(tab => {
                if (tab && tab.status === 'complete') {
                    return Tabs.sendMessage(tab.id, message, options)
                        .catch(() => console.log(`Receiving end probably does not exist.`));
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
            .then(tabs => tabs.filter(tab => (!!tab && !!tab.id && !!tab.url && isValidWebUrl(tab.url) && tab.status === 'complete')))
            .then(tabs => tabs.forEach(tab =>
                Tabs.sendMessage(tab.id, message, options)
                    .catch(() => console.log(`Message broadcast: Skipping ${tab.id}. Receiving end probably does not exist.`))
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
        chrome.tabs.executeScript(tabId, details, results => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(results);
            }
        });
    });

    /**
     * Updates a tab of {@param tabId}
     * with new {@param updateProperties}
     */
    static update = (tabId, updateProperties) => new Promise((resolve, reject) => {
        chrome.tabs.update(tabId, updateProperties, tab => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(tab);
            }
        });
    });

    /**
     * Gets the active tab in the current window.
     *
     * @see {@link https://developer.chrome.com/extensions/tabs#method-query}
     */
    static getActive = () => new Promise(resolve => {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, tabs => {
            if (!!tabs && tabs.length === 1) {
                resolve(tabs[0]);
            } else {
                console.log("Unable to get active tab");
                resolve(null);
            }
        });
    });

    /**
     * Gets all Tabs.
     *
     * @see {@link https://developer.chrome.com/extensions/tabs#method-query}
     */
    static getAll = () => new Promise((resolve) => {
        chrome.tabs.query({}, tabs => resolve(tabs));
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
        chrome.tabs.remove(tabId, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(`Tab ${tabId} removed`);
            }
        })
    });

    /**
     * Initializer script to be "run" when the script starts
     */
    static run() {
        /**
         * Fired when a tab is updated.
         * @see {@link https://developer.chrome.com/extensions/tabs#event-onUpdated}
         */
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            console.log("onUpdated changeInfo:", changeInfo);
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

export default Tabs;
