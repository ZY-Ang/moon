/*
 * Copyright (c) 2018 moon
 */

/**
 * @abstract {@class} for interaction with the browser's runtime API.
 * Should not be used directly. Instead, use a child class
 * that inherits this as a parent.
 */
class Runtime {
    constructor() {
        if (new.target === Runtime) {
            throw new TypeError("Cannot construct Abstract instances directly.");
        }
    }

    /**
     * The id of the extension tied to the private key as defined in manifest.json.
     * Note: This should be similar for both dev and prod on chrome. Firefox auto
     * generates the key so new id has to be dynamically generated every time.
     */
    static id = (!!chrome && !!chrome.runtime && chrome.runtime.id) ||
                (!!browser && !!browser.runtime && browser.runtime.id) ||
                'ehmpejjklcibliopgbghpgfinhbjopnn';

    /**
     * Returns details about the app or extension from the manifest.
     * The object returned is a serialization of the full manifest file.
     * @returns {object}
     *
     * @see {@link https://developer.chrome.com/extensions/runtime#method-getManifest}
     */
    static getManifest = () => {
        return chrome.runtime.getManifest();
    };

    /**
     * Converts a {@param relativePath} within an app/extension
     * install directory to a fully-qualified URL.
     *
     * @return {string}
     */
    static getURL = (relativePath) => {
        return chrome.runtime.getURL(relativePath);
    };
}

export default Runtime;
