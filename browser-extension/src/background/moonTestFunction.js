/*
 * Copyright (c) 2018 moon
 */

import getAWSAppSyncClient from "./api/MoonGraphQL";
import {onUpdateCoinbaseApiKey} from "./api/coinbase";

let subscription = null;

/**
 * A test function to be used for prototyping new APIs.
 * This will be automatically tree-shaken out in production.
 */
const moonTestFunction = (params) => {
    console.log("moonTestFunction");
    const awsAppSyncClient = getAWSAppSyncClient();

    if (subscription) {
        console.log("subscription: ", subscription);
        subscription.unsubscribe();
        subscription = null;
    } else {
        subscription = awsAppSyncClient
            .subscribe({query: onUpdateCoinbaseApiKey})
            .subscribe({
                next: ({data}) => console.log("next-data: ", data),
                complete: console.log,
                error: console.error
            });
        console.log("subscription: ", subscription);
    }
    return new Promise(resolve => resolve(subscription));
};

export default moonTestFunction;
