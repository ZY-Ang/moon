/*
 * Copyright (c) 2018 moon
 */

import getAWSAppSyncClient from "./api/AWSAppSyncClient";
import {handleErrors} from "../utils/errors";
import {onUpdateCoinbaseApiKey} from "./api/coinbase";

/**
 * A test function to be used for prototyping new APIs.
 * This will be automatically tree-shaken out in production.
 */
const moonTestFunction = (params) => {
    console.log("moonTestFunction");
    return getAWSAppSyncClient()
        .then(awsAppSyncClient => {
            const observable = awsAppSyncClient.subscribe({query: onUpdateCoinbaseApiKey});

            observable
                .subscribe({
                    next: (data) => console.log("next-data: ", data),
                    complete: () => console.log("complete: ", args),
                    error: () => console.error("error: ", args)
                })
        })
        .catch(handleErrors);
};

export default moonTestFunction;
