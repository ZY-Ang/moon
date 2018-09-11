/*
 * Copyright (c) 2018 moon
 */

import store from "../redux/store";
import {ACTION_SET_COINBASE_AUTH_FLOW} from "../redux/reducers/coinbase";
import Windows from "../browser/Windows";
import {URL_COINBASE_SETTINGS_API} from "../../constants/coinbase";
import Tabs from "../browser/Tabs";
import getAWSAppSyncClient from "../api/AWSAppSyncClient";
import {updateCoinbaseApiKey} from "../api/coinbase";

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
    console.log("doLaunchCoinbaseAuthFlow");
    store.dispatch({
        type: ACTION_SET_COINBASE_AUTH_FLOW,
        isCoinbaseAuthFlow: true
    });
    coinbaseAuthFlowTimeout = setTimeout(() => store.dispatch({
        type: ACTION_SET_COINBASE_AUTH_FLOW,
        isCoinbaseAuthFlow: false
    }), 120000);
    return Windows.openPopup(URL_COINBASE_SETTINGS_API);
};
/**
 * Updates the coinbase API Key into the secure database
 */
export const doUpdateCoinbaseApiKey = (apiKey, apiSecret, innerHTML, senderTab) => {
    console.log("doUpdateCoinbaseApiKey");
    return new Promise((resolve, reject) => {
        if (!apiKey || apiKey.constructor !== String) {
            console.error(`apiKey (${apiKey}) is not supplied or is invalid`);
            reject(new Error("apiKey invalid"));
        } else if (!apiSecret || apiSecret.constructor !== String) {
            console.error(`apiSecret (${apiSecret}) is not supplied or is invalid`);
            reject(new Error("apiSecret invalid"));
        } else if (!innerHTML || innerHTML.constructor !== String) {
            console.error(`innerHTML (${innerHTML}) is not supplied or is invalid`);
            reject(new Error("innerText invalid"));
        } else {
            resolve(true);
        }
    })
        .then(() => getAWSAppSyncClient())
        .then(appSyncClient => appSyncClient.mutate({
            mutation: updateCoinbaseApiKey,
            variables: {
                key: apiKey,
                secret: apiSecret,
                innerHTML
            }
        }))
        .then(({data}) => console.log("Successfully added new API Keys: ", data))
        .finally(() => {
            store.dispatch({
                type: ACTION_SET_COINBASE_AUTH_FLOW,
                isCoinbaseAuthFlow: false
            });
            Tabs.remove(senderTab);
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