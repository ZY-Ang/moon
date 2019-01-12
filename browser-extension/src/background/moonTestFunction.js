/*
 * Copyright (c) 2018 moon
 */

import MoonGraphQL from "./api/MoonGraphQL";
import {onUpdateUser} from "./api/user";
import backgroundLogger from "./utils/BackgroundLogger";

let subscription = null;

/**
 * A test function to be used for prototyping new APIs.
 * This will be automatically tree-shaken out in production.
 */
const moonTestFunction = async (params) => {
    backgroundLogger.log("moonTestFunction");
    const awsAppSyncClient = await MoonGraphQL.authClient;

    if (subscription) {
        backgroundLogger.log("subscription: ", subscription);
        subscription.unsubscribe();
        subscription = null;
    } else {
        subscription = awsAppSyncClient
            .subscribe({query: onUpdateUser})
            .subscribe({
                next: ({data}) => backgroundLogger.log("next-data: ", data),
                complete: res => backgroundLogger.log(res),
                error: err => backgroundLogger.error(err)
            });
        backgroundLogger.log("subscription: ", subscription);
    }
    return new Promise(resolve => resolve(subscription));
};

export default moonTestFunction;
