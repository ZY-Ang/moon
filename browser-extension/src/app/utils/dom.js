/*
 * Copyright (c) 2018 moon
 */

/**
 * Observes a particular DOM element for state mutations.
 * Particularly useful when used on a React App to obtain
 * OAuth flows, etc.
 *
 * TODO: Refactor to ES6
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
        obs.observe(obj, {childList: true, subtree: true});

    } else if (window.addEventListener) {
        obj.addEventListener('DOMNodeInserted', callback, false);
        obj.addEventListener('DOMNodeRemoved', callback, false);
    }
};