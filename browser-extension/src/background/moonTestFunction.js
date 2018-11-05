/*
 * Copyright (c) 2018 moon
 */

import MoonGraphQL from "./api/MoonGraphQL";
import {onUpdateUser} from "./api/moon";

let subscription = null;

/**
 * A test function to be used for prototyping new APIs.
 * This will be automatically tree-shaken out in production.
 */
const moonTestFunction = async (params) => {
    console.log("moonTestFunction");
    const awsAppSyncClient = await MoonGraphQL.authClient;

    if (subscription) {
        console.log("subscription: ", subscription);
        subscription.unsubscribe();
        subscription = null;
    } else {
        subscription = awsAppSyncClient
            .subscribe({query: onUpdateUser})
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
