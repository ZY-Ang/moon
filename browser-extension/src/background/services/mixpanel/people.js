/*
 * Copyright (c) 2019 moon
 */

import backgroundLogger from "../../utils/BackgroundLogger";
import mixpanel from "mixpanel-browser";
import backgroundMixpanel from "./backgroundMixpanel";

class People {

    /**
     * Set properties on a user record in Mixpanel using Mixpanel People Analytics
     *
     * @param {Object} [properties] A set of properties to associate with the user profile.
     */
    set = async (properties) => {
        if (!backgroundMixpanel.mixPanelReady) {
            backgroundLogger.warn("Mixpanel not loaded yet.");
            return true;
        } else {
            return new Promise((resolve) => mixpanel.people.set(properties, resolve));
        }
    };

    /**
     * Set properties on a user record in Mixpanel using Mixpanel People Analytics. Properties set with this method are
     * only written once and will not be overwritten in future calls
     *
     * @param {Object} [properties] A set of properties to associate with the user profile.
     */
    set_once = async (properties) => {
        if (!backgroundMixpanel.mixPanelReady) {
            backgroundLogger.warn("Mixpanel not loaded yet.");
            return true;
        } else {
            return new Promise((resolve) => mixpanel.people.set_once(properties, resolve));
        }
    };

    /**
     * Increment properties of a user by a specified amount in Mixpanel using Mixpanel People Analytics. If increment
     * amount is not specified, properties are incremented by one.
     *
     * @param {Object} [properties] Properties of user to increment. Can be a string or an object.
     * @param {Number} by Amount by which to increment properties. Default is 1 if not supplied.
     */
    increment = async (properties, by) => {
        if (!backgroundMixpanel.mixPanelReady) {
            backgroundLogger.warn("Mixpanel not loaded yet.");
            return true;
        } else {
            return new Promise((resolve) => mixpanel.people.increment(properties, by, resolve));
        }
    };

    /**
     * Track a purchase by a user in base currency for reporting in Mixpanel using Mixpanel People Analytics.
     *
     * @param {Number} amount Amount the user spent in base currency
     * @param {Object} [properties] Properties to associate with this transaction
     */
    track_charge = async (amount, properties) => {
        if (!backgroundMixpanel.mixPanelReady) {
            backgroundLogger.warn("Mixpanel not loaded yet.");
            return true;
        } else {
            return new Promise((resolve) => mixpanel.people.track_charge(amount, properties, resolve));
        }
    };

}

export default new People();