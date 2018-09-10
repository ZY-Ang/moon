/*
 * Copyright (c) 2018 moon
 */

import AWSAppSyncClient from "aws-appsync";
import AuthUser from "../auth/AuthUser";
import AppSyncConfig from "../config/aws/appsync";

/**
 * In-memory cache of the AppSync client
 */
let AWSAppSyncClientCache = null;

/**
 * In-memory cache of the unauthenticated AppSync client
 * TODO: Implement
 */
let AWSAppSyncClientUnAuthenticatedCache = null;

/**
 * Obtains the cached AppSync client with valid credentials,
 * or refreshes the credentials and returns a new instance.
 */
const getAWSAppSyncClient = async () => {
    const authUser = AuthUser.getInstance();
    if (!authUser) {
        // TODO: Create unauthenticated API
        throw new Error("User is not authenticated");

    } else if (AWSAppSyncClientCache && authUser.isSessionValid()) {
        return AWSAppSyncClientCache;

    } else {
        const config = await AppSyncConfig.getAuthConfig();
        AWSAppSyncClientCache = new AWSAppSyncClient(config);
        return AWSAppSyncClientCache;
    }
};

export default getAWSAppSyncClient;
