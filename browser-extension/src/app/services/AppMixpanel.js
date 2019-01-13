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
    static peopleSet = (properties) => AppRuntime.sendMessage(REQUEST_MIXPANEL, {
        _functionName: "peopleSet",
        _args: {properties}
    });
    static peopleSetOnce = (properties) => AppRuntime.sendMessage(REQUEST_MIXPANEL, {
        _functionName: "peopleSetOnce",
        _args: {properties}
    });
    static peopleIncrement = (properties, by) => AppRuntime.sendMessage(REQUEST_MIXPANEL, {
        _functionName: "peopleIncrement",
        _args: {properties, by}
    });
    static peopleTrackCharge = (amount, properties) => AppRuntime.sendMessage(REQUEST_MIXPANEL, {
        _functionName: "peopleTrackCharge",
        _args: {amount, properties}
    });
}

export default AppMixpanel;
