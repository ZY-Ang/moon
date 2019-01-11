/*
 * Copyright (c) 2018 moon
 */

import store from "../redux/store";
import {ACTION_SET_COINBASE_AUTH_FLOW} from "../redux/reducers/coinbase";
import Windows from "../browser/Windows";
import {URL_COINBASE_SETTINGS_API} from "../../constants/coinbase";
import {doUpdateCoinbaseApiKey} from "../api/user";

/**
 * Global timeout variable defined to
 * @type {null}
 */
let coinbaseAuthFlowTimeout = null;

/**
 * Launches and begins the coinbase auth flow in a new window
 */
export const doLaunchCoinbaseAuthFlow = () => {
    clearTimeout(coinbaseAuthFlowTimeout);
    logger.log("doLaunchCoinbaseAuthFlow");
    store.dispatch({
        type: ACTION_SET_COINBASE_AUTH_FLOW,
        isCoinbaseAuthFlow: true
    });
    coinbaseAuthFlowTimeout = setTimeout(() => store.dispatch({
        type: ACTION_SET_COINBASE_AUTH_FLOW,
        isCoinbaseAuthFlow: false
    }), 300000);
    return Windows.create({
        url: URL_COINBASE_SETTINGS_API,
        type: "popup"
    });
};
/**
 * Updates the coinbase API Key into the secure database
 */
export const doUpdateCoinbaseApiKeyEvent = (apiKey, apiSecret, innerHTML, senderTab) => {
    logger.log("doUpdateCoinbaseApiKeyEvent");
    return new Promise((resolve, reject) => {
        if (!apiKey || apiKey.constructor !== String) {
            logger.error(`apiKey (${apiKey}) is not supplied or is invalid`);
            reject(new Error("apiKey invalid"));
        } else if (!apiSecret || apiSecret.constructor !== String) {
            logger.error(`apiSecret (${apiSecret}) is not supplied or is invalid`);
            reject(new Error("apiSecret invalid"));
        } else if (!innerHTML || innerHTML.constructor !== String) {
            logger.error(`innerHTML (${innerHTML}) is not supplied or is invalid`);
            reject(new Error("innerHTML invalid"));
        } else {
            resolve(true);
        }
    })
        .then(() => doUpdateCoinbaseApiKey(apiKey, apiSecret, innerHTML))
        .then(({data}) => logger.log("Successfully added new API Keys: ", data))
        .finally(() => {
            store.dispatch({
                type: ACTION_SET_COINBASE_AUTH_FLOW,
                isCoinbaseAuthFlow: false
            });
            return true;
        });
};
/**
 * Returns the state of the coinbase auth
 * flow from the coinbase redux state
 * @return {boolean} {@code true} if the
 * user has requested an authorization via
 * coinbase or false otherwise.
 */
export const isCoinbaseAuthFlow = () =>
    store.getState().coinbaseState.isCoinbaseAuthFlow;