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
}

export default AppMixpanel;
