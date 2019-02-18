/*
 * Copyright (c) 2018 moon
 */

/**
 * Interface for interaction with the browser's storage API
 */
const Storage = {
    local: {
        /**
         * Gets value(s) corresponding to
         * {@param keys {string | array<string>}}}
         * from the browser's storage.local api
         *
         * @see {@link https://developer.chrome.com/extensions/storage#type-StorageArea}
         * @see {Link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/StorageArea/get}
         */
        get: (keys) => new Promise((resolve, reject) => {
            if (process.env.BROWSER === "firefox") {
                const gettingItem = browser.storage.local.get(keys);
                gettingItem.then(obj => {
                    resolve(obj);
                }).catch(err => {
                    reject(err);
                })
            } else {
                    chrome.storage.local.get(keys, obj => {
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError);
                        } else {
                            resolve(obj);
                        }
                    });
                }
        }),

        /**
         * Sets corresponding key-value pairs present in
         * an {@param obj {object}} to the browser's
         * storage.local api
         *
         * @see {@link https://developer.chrome.com/extensions/storage#type-StorageArea}
         * @see {@Link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/StorageArea/set}
         */
        set: (obj) => new Promise((resolve, reject) => {
                if (process.env.BROWSER === "firefox") {
                    const settingItem = browser.storage.local.set(obj);
                    settingItem.then(() => {
                        resolve(obj);
                    }).catch(err => {
                        reject(err);
                    });
                } else if (process.env.BROWSER === "chrome") {
                    chrome.storage.local.set(obj, () => {
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError);
                        } else {
                            resolve(obj);
                        }
                    });
                }
        }),

        /**
         * Removes {@param keys {string | array<string>}}}
         * corresponding values from the browser's
         * storage.local api
         *
         * @see {@link https://developer.chrome.com/extensions/storage#type-StorageArea}
         * @see {@Link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/StorageArea/remove}
         */
        remove: (keys) => new Promise((resolve, reject) => {
                if (process.env.BROWSER === "firefox") {
                    const removingItem = browser.storage.local.remove(keys);
                    removingItem.then(() => {
                        resolve(`Removed ${JSON.stringify(keys)} from storage.local successfully`);
                    }).catch(err => {
                        reject(err);
                    });
                } else if (process.env.BROWSER === "chrome") {
                    chrome.storage.local.remove(keys, () => {
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError);
                        } else {
                            resolve(`Removed ${JSON.stringify(keys)} from storage.local successfully`);
                        }
                    });
                }
        }),

        /**
         * Removes all items from the browser's
         * storage.local api
         *
         * @see {@link https://developer.chrome.com/extensions/storage#type-StorageArea}
         * @see {@Link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/StorageArea/clear}
         */
        clear: () => new Promise((resolve, reject) => {
            if (process.env.BROWSER === "firefox") {
                const clearing = browser.storage.local.clear();
                clearing.then(() => {
                    resolve("Storage.local cleared.");
                }).catch(err => {
                    reject(err);
                });
            } else if (process.env.BROWSER === "chrome") {
                chrome.storage.local.clear(() => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve("Storage.local cleared.");
                    }
                });
            }
        })
    }
};

export default Storage;
