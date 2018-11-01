/*
 * Copyright (c) 2018 moon
 */

import Runtime from "../../browser/Runtime";
import Tabs from "./Tabs";
import {URL_EXTENSION_INSTALLED, URL_EXTENSION_UNINSTALLED} from "../../constants/url";
import {isValidWebUrl} from "../../utils/url";
import messageCenter from "../messageCenter";

/**
 * Utility Class for interaction with the browser's runtime API
 * @class
 */
class BackgroundRuntime extends Runtime {
    /**
     * Initializer script to be "run" when the script starts
     */
    static run() {
        /**
         * Fired when the background script receives a new message.
         *
         * Note: Code looks the same for both content and background scripts.
         *
         * @see {@link https://developer.chrome.com/extensions/runtime#event-onMessage}
         */
        chrome.runtime.onMessage.addListener(messageCenter);

        /**
         * Fired when the extension is installed, updated, or when chrome is updated.
         *
         * @see {@link https://developer.chrome.com/apps/runtime#event-onInstalled}
         */
        chrome.runtime.onInstalled.addListener(details => {
            const version = Runtime.getManifest().version;
            if (details.reason === 'install') {
                console.log(`Moon extension v${version} has been installed!`);
                // First time installing
                chrome.tabs.create({url: URL_EXTENSION_INSTALLED}, (tab) => {
                    // TODO: Referral code
                });

            } else if (details.reason === 'update') {
                console.log(`Moon extension has been updated to v${version}!`);

            }
            // Update of the currently installed extension
            //  Reboot all content scripts in all tabs in all windows
            const manifest = BackgroundRuntime.getManifest();
            const contentScripts = manifest.content_scripts[0].js;
            Tabs.getAll()
                .then(tabs => tabs.filter(tab => (!!tab && !!tab.id && !!tab.url && isValidWebUrl(tab.url) && tab.status === 'complete')))
                .then(tabs => tabs.forEach(tab =>
                    contentScripts.forEach(file =>
                        Tabs.executeScript(tab.id, {file})
                            .catch(() => console.log(`Skipping ${tab.id} with ${tab.url}`))
                    )
                ));
        });

        /**
         * Set the URL to be opened when the extension is uninstalled
         *
         * @see {@link https://developer.chrome.com/extensions/runtime#method-setUninstallURL}
         */
        chrome.runtime.setUninstallURL(URL_EXTENSION_UNINSTALLED);
    }
}

export default BackgroundRuntime;
