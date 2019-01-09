/*
 * Copyright (c) 2018 moon
 */

import MoonGraphQL from "./api/MoonGraphQL";
import {onUpdateUser} from "./api/user";

let subscription = null;

/**
 * A test function to be used for prototyping new APIs.
 * This will be automatically tree-shaken out in production.
 */
const moonTestFunction = async (params) => {
    logger.log("moonTestFunction");
    const awsAppSyncClient = await MoonGraphQL.authClient;

    if (subscription) {
        logger.log("subscription: ", subscription);
        subscription.unsubscribe();
        subscription = null;
    } else {
        subscription = awsAppSyncClient
            .subscribe({query: onUpdateUser})
            .subscribe({
                next: ({data}) => logger.log("next-data: ", data),
                complete: logger.log,
                error: logger.error
            });
        logger.log("subscription: ", subscription);
    }
    return new Promise(resolve => resolve(subscription));
};

export default moonTestFunction;
