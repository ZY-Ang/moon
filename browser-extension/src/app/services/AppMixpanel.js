/*
 * Copyright (c) 2019 moon
 */

import AppRuntime from "../browser/AppRuntime";
import {REQUEST_MIXPANEL} from "../../constants/events/appEvents";

class AppMixpanel {
    static track = (event_name, properties) => AppRuntime.sendMessage(REQUEST_MIXPANEL, {
        _functionName: "track",
        _args: {event_name, properties}
    });

    static people = {
        set: (properties) => AppRuntime.sendMessage(REQUEST_MIXPANEL, {
            _functionName: "people.set",
            _args: {properties}
        }),
        set_once: (properties) => AppRuntime.sendMessage(REQUEST_MIXPANEL, {
        _functionName: "people.set_once",
        _args: {properties}
        }),
        increment: (properties, by) => AppRuntime.sendMessage(REQUEST_MIXPANEL, {
            _functionName: "people.increment",
            _args: {properties, by}
        }),
        track_charge: (amount, properties) => AppRuntime.sendMessage(REQUEST_MIXPANEL, {
            _functionName: "people.track_charge",
            _args: {amount, properties}
        })
    };
}

export default AppMixpanel;
