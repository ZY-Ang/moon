/*
 * Copyright (c) 2018 moon
 */

import logoDisabled from "../../../../assets/icons/logo_disabled_128.png";
import logo from "../../../../assets/icons/logo_128.png";
import {SOURCE_MANUAL} from "../../constants/events/backgroundEvents";
import {doInjectAppEvent} from "../windowManager";
import BackgroundMixpanel from "../services/BackgroundMixpanel";

/**
 * Interface for interaction with the browser's browserAction API
 */
class BrowserAction {
    /**
     * Sets the browser action icon to the active {@code logo}
     * for a particular {@param tabId}
     * @see {@link https://developer.chrome.com/extensions/browserAction#method-setIcon}
     */
    static setValidIcon = (tabId) => new Promise((resolve, reject) => {
        chrome.browserAction.setIcon({path: chrome.runtime.getURL(logo), tabId}, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(`Successfully set VALID icon for tab ${tabId}.`);
            }
        });
    });
    /**
     * Sets the browser action icon to {@code logoDisabled}
     * for a particular {@param tabId}
     * @see {@link https://developer.chrome.com/extensions/browserAction#method-setIcon}
     */
    static setInvalidIcon = (tabId) => new Promise((resolve, reject) => {
        chrome.browserAction.setIcon({path: chrome.runtime.getURL(logoDisabled), tabId}, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(`Successfully set INVALID icon for tab ${tabId}.`);
            }
        });
    });
    /**
     * Sets the browser action badge text to
     * {@param text} on an optional {@param tabId}
     * @see {@link https://developer.chrome.com/extensions/browserAction#method-setBadgeText}
     */
    static setBadgeText = (text, tabId) => new Promise((resolve, reject) => {
        const details = {text, tabId};
        chrome.browserAction.setBadgeText(details, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(`Successfully set badge text "${text}" for tab ${tabId}.`);
            }
        });
    });

    /**
     * Initializer script to be "run" when the script starts
     */
    static run() {
        /**
         * Fired when a browser action icon is clicked.
         * @see {@link https://developer.chrome.com/extensions/browserAction#event-onClicked}
         */
        chrome.browserAction.onClicked.addListener(() => {
            BackgroundMixpanel.track('button_click_moon_toolbar');
            return doInjectAppEvent(SOURCE_MANUAL);
        });

        /**
         * Sets the background color for the badge (notification).
         * @see {@link https://developer.chrome.com/extensions/browserAction#method-setBadgeBackgroundColor}
         */
        chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
    }
}

export default BrowserAction;
