/*
 * Copyright (c) 2019 moon
 */

import mixpanel from "mixpanel-browser";

const TOKEN_MIXPANEL = "238c4bc9d59e41ef38cfb8f53f1fdc60";

let mixPanelReady = false;

mixpanel.init(TOKEN_MIXPANEL, {
    api_host: "https://api.mixpanel.com",
    loaded: () => {
        // Do stuff on mixpanel load
        mixPanelReady = true;
    }
});

class BackgroundMixPanel {
    /**
     * Track an event. This is the most important and
     * frequently used Mixpanel function.
     *
     * ### Usage:
     *
     *     // track an event named 'Registered'
     *     mixpanel.track('Registered', {'Gender': 'Male', 'Age': 21});
     *
     * To track link clicks or form submissions, see track_links() or track_forms().
     *
     * @param {String} eventName The name of the event. This can be anything the user does - 'Button Click', 'Sign Up', 'Item Purchased', etc.
     * @param {Object} [properties] A set of properties to include with the event you're sending. These describe the user who did the event or details about the event itself.
     */
    static track = async (eventName, properties) => {
        if (!mixPanelReady) {
            logger.warn("Mixpanel not loaded yet.");
            return true;
        } else {
            return new Promise((resolve) => mixpanel.track(eventName, properties, resolve));
        }
    };

    /**
     * @param _functionName - of {@code mixpanel} to be forwarded to
     * @param args {object} - to be forwarded
     */
    static resolve = async (_functionName, args) => {
        const resolver = {
            track: () => BackgroundMixPanel.track(args.event_name, args.properties)
        };
        if (!_functionName) {
            throw new Error("_functionName not provided for mixpanel api");
        } else if (!resolver[_functionName]) {
            throw new Error(`${_functionName} is not a valid or authorized mixpanel API. Please manually add the API you are trying to use in the resolver if you are using a new API.`);
        } else {
            return resolver[_functionName]();
        }
    }
}

export default BackgroundMixPanel;
