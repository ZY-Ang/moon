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
         */
        get: (keys) => new Promise((resolve, reject) => {
            chrome.storage.local.get(keys, obj => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(obj);
                }
            })
        }),

        /**
         * Sets corresponding key-value pairs present in
         * an {@param obj {object}} to the browser's
         * storage.local api
         *
         * @see {@link https://developer.chrome.com/extensions/storage#type-StorageArea}
         */
        set: (obj) => new Promise((resolve, reject) => {
            chrome.storage.local.set(obj, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(obj);
                }
            })
        }),

        /**
         * Removes {@param keys {string | array<string>}}}
         * corresponding values from the browser's
         * storage.local api
         *
         * @see {@link https://developer.chrome.com/extensions/storage#type-StorageArea}
         */
        remove: (keys) => new Promise((resolve, reject) => {
            chrome.storage.local.remove(keys, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(`Removed ${JSON.stringify(keys)} from storage.local successfully`);
                }
            })
        }),

        /**
         * Removes all items from the browser's
         * storage.local api
         *
         * @see {@link https://developer.chrome.com/extensions/storage#type-StorageArea}
         */
        clear: () => new Promise((resolve, reject) => {
            chrome.storage.local.clear(() => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve("Storage.local cleared.");
                }
            })
        })
    }
};

export default Storage;
