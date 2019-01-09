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

class MixPanel {
    static track() {
        if (mixPanelReady) {
            mixpanel.track(arguments);
        }
    }
}

export default MixPanel;
