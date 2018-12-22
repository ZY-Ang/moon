/*
 * Copyright (c) 2018 moon
 */
import injectAmazonPayWithMoonButtons from "./www.amazon.com";

export const ID_BUTTON_PAY_WITH_MOON_PRIMARY = "button-pay-with-moon";

export const injectButton = () => {
    const moonButtonInjectionScriptHostMap = {
        "www.amazon.com": injectAmazonPayWithMoonButtons
    };

    if (window && window.location && moonButtonInjectionScriptHostMap[window.location.host]) {
        moonButtonInjectionScriptHostMap[window.location.host]();
    }
};
