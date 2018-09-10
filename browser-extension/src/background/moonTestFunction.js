/*
 * Copyright (c) 2018 moon
 */

import getAWSAppSyncClient from "./api/AWSAppSyncClient";
import {handleErrors} from "../utils/errors";
import {updateCoinbaseApiKey} from "./api/coinbase";

/**
 * A test function to be used for prototyping new APIs.
 * This will be automatically tree-shaken out in production.
 */
const moonTestFunction = (params) => {
    console.log("moonTestFunction");

    return getAWSAppSyncClient()
        .then(client => {
            return client.mutate({
                mutation: updateCoinbaseApiKey,
                variables: {
                    key: params.key,
                    secret: params.secret
                }
            });
        })
        .then(({data}) => {
            if (data) {
                console.log("MUTATION DATA: ", data);
            }
        })
        .catch(handleErrors);
};

export default moonTestFunction;
