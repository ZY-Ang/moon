/*
 * Copyright (c) 2018 moon
 */

chrome.browserAction.onClicked.addListener(function(tab) {
    alert('icon clicked');
    chrome.tabs.query({
        active: true,
        currentWindow: true,
    }, (tabs) => {
        // Send message to script file
        chrome.tabs.sendMessage(
            tabs[0].id,
            { injectApp: true },
            response => window.close()
        );
    });
});
