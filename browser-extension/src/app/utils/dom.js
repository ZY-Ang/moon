/*
 * Copyright (c) 2018 moon
 */

/**
 * Observes a particular DOM element for state mutations.
 * Particularly useful when used on a React App to obtain
 * OAuth flows, etc.
 */
export const observeDOM = (obj, callback) => {
    const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    if (!obj || obj.nodeType !== 1) return; // validation

    if (MutationObserver) {
        // define a new observer
        const obs = new MutationObserver(function (mutations, observer) {
            if (mutations[0].addedNodes.length || mutations[0].removedNodes.length)
                callback(mutations[0]);
        });
        // have the observer observe foo for changes in children
        obs.observe(obj, {attributes: true, childList: true, subtree: true});

    } else if (window.addEventListener) {
        obj.addEventListener('DOMNodeInserted', callback, false);
        obj.addEventListener('DOMNodeRemoved', callback, false);
    }
};

/**
 * Copies a {@param text} string to the clipboard via the
 * {@code document.execCommand('copy')} API.
 */
export const copyToClipboard = async (text) => {
    if (text && text.constructor === String) {
        const textField = document.createElement('textarea');
        textField.innerText = text;
        document.body.appendChild(textField);
        textField.select();
        document.execCommand('copy');
        textField.remove();
        return text;
    }
    throw new Error(`Unable to copy (${text}) to clipboard. `);
};
