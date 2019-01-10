/*
 * Copyright (c) 2019 moon
 */

import mixpanel from "mixpanel-browser";
import AuthUser from "../auth/AuthUser";

const TOKEN_MIXPANEL = "238c4bc9d59e41ef38cfb8f53f1fdc60";

let mixPanelReady = false;

mixpanel.init(TOKEN_MIXPANEL, {
    api_host: "https://api.mixpanel.com",
    loaded: () => {
        // Do stuff on mixpanel load
        mixPanelReady = true;
    }
});

class BackgroundMixpanel {
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
     * Identify a user with a unique ID instead of a Mixpanel
     * randomly generated distinct_id. If the method is never called,
     * then unique visitors will be identified by a UUID generated
     * the first time they visit the site.
     *
     * ### Notes:
     *
     * You can call this function to overwrite a previously set
     * unique ID for the current user. Mixpanel cannot translate
     * between IDs at this time, so when you change a user's ID
     * they will appear to be a new user.
     *
     * When used alone, mixpanel.identify will change the user's
     * distinct_id to the unique ID provided. When used in tandem
     * with mixpanel.alias, it will allow you to identify based on
     * unique ID and map that back to the original, anonymous
     * distinct_id given to the user upon her first arrival to your
     * site (thus connecting anonymous pre-signup activity to
     * post-signup activity). Though the two work together, do not
     * call identify() at the same time as alias(). Calling the two
     * at the same time can cause a race condition, so it is best
     * practice to call identify on the original, anonymous ID
     * right after you've aliased it.
     * <a href="https://mixpanel.com/help/questions/articles/how-should-i-handle-my-user-identity-with-the-mixpanel-javascript-library">Learn more about how mixpanel.identify and mixpanel.alias can be used</a>.
     *
     * @param {String} [uniqueId] A string that uniquely identifies a user. If not provided, the distinct_id currently in the persistent store (cookie or localStorage) will be used.
     */
    static identify = async (uniqueId) => {
        if (!mixPanelReady) {
            logger.warn("Mixpanel not loaded yet.");
            return true;
        } else {
            return new Promise((resolve) => mixpanel.identify(uniqueId, resolve));
        }
    };

    /**
     * @param functionName - of {@code mixpanel} to be forwarded to
     * @param args {object} - to be forwarded
     */
    static resolve = async (functionName, args) => {
        // Identify user automatically.
        BackgroundMixpanel.identify(AuthUser.getEmail()).catch();

        // Resolver for mixpanel API types. Add more as you wish.
        const resolver = {
            track: () => BackgroundMixpanel.track(args.event_name, args.properties)
        };

        if (!functionName) {
            throw new Error("Please provide a _functionName for the mixpanel api you want to use");

        } else if (functionName.constructor !== String) {
            throw new Error("Please provide a valid _functionName (String) for the mixpanel api you want to use");

        } else if (!resolver[functionName]) {
            throw new Error(`${functionName} is not a valid or authorized mixpanel API. Please manually add the API you are trying to use in the resolver if you are using a new API.`);

        } else {
            return resolver[functionName]();

        }
    }
}

export default BackgroundMixpanel;
