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
    static set = (properties) => AppRuntime.sendMessage(REQUEST_MIXPANEL, {
        _functionName: "set",
        _args: {properties}
    });
    static setOnce = (properties) => AppRuntime.sendMessage(REQUEST_MIXPANEL, {
        _functionName: "setOnce",
        _args: {properties}
    });
    static increment = (properties, by) => AppRuntime.sendMessage(REQUEST_MIXPANEL, {
        _functionName: "increment",
        _args: {properties, by}
    });
    static trackCharge = (amount, properties) => AppRuntime.sendMessage(REQUEST_MIXPANEL, {
        _functionName: "trackCharge",
        _args: {amount, properties}
    });
}

export default AppMixpanel;
