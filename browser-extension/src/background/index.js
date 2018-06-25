/*
 * Copyright (c) 2018 moon
 */

import logo from "../../../assets/icons/logo_128.png";
import logoDisabled from "../../../assets/icons/logo_disabled_128.png";
import supportedSites from "../../supportedSites.json";
import {REQUEST_INJECT_APP, SOURCE_MANUAL, SOURCE_NONE} from "../constants/events";

chrome.browserAction.setIcon({path: chrome.extension.getURL(logoDisabled)});

const isValidSite = (url) => {
    for (let i = 0; i < supportedSites.length; i++) {
        if (url.toLowerCase().search(supportedSites[i].noncheckoutURL.toLowerCase()) > 0) return true;
    }
    return false;
};

const setInvalidBrowserActionIcon = (tabId) => {
    chrome.browserAction.setIcon({path: chrome.extension.getURL(logoDisabled), tabId});
};

const setValidBrowserActionIcon = (tabId) => {
    chrome.browserAction.setIcon({path: chrome.extension.getURL(logo), tabId});
};

const onTabUpdate = (tab) => {
    if (!tab.url) {
        // URL does not exist yet
        setInvalidBrowserActionIcon();
        doInjectAppEvent(SOURCE_NONE);

    } else if (isValidSite(tab.url)) {
        // URL that is on the current tab exists and is valid
        setValidBrowserActionIcon(tab.id);
        doInjectAppEvent(tab.url);

    } else {
        // URL that is on the current tab exists but is not valid
        setInvalidBrowserActionIcon(tab.id);
        doInjectAppEvent(SOURCE_NONE);
    }
};

const doInjectAppEvent = (source) => {
    chrome.tabs.query({
        active: true,
        currentWindow: true,
    }, (tabs) => {
        // Send message to script file
        const message = {
            source: source,
            type: REQUEST_INJECT_APP
        };
        console.log("Sending message: ", message);
        chrome.tabs.sendMessage(tabs[0].id, message, null,
            response => console.log("response: ", response)
        );
    });
};

chrome.browserAction.onClicked.addListener(() => doInjectAppEvent(SOURCE_MANUAL));
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log("onUpdated changeInfo:", changeInfo);
    if (changeInfo.status === "complete") {
        onTabUpdate(tab);
    }
});
chrome.tabs.onActivated.addListener(activeInfo => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        onTabUpdate(tab);
    });
});
