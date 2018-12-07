/*
 * Copyright (c) 2018 moon
 */

import AWSAppSyncClient from "aws-appsync";
import {AppSyncAuthConfig, AppSyncPublicConfig} from "../config/aws/appsync";
import {doClearUserCache} from "./user";

/**
 * Utility class to obtain graphql client for application.
 */
class MoonGraphQL {
    /** @readonly */
    static _authClient = null;

    /** @readonly */
    static _publicClient = new AWSAppSyncClient(AppSyncPublicConfig);

    /**
     * Remove {@static _authClient} instance on sign out
     */
    static signOut = () => {
        doClearUserCache();
        MoonGraphQL._authClient = null;
    };

    /**
     * The authenticated AppSync client with valid credentials.
     * Automatically refreshes JWT them when necessary.
     *
     * @returns {Promise<AWSAppSyncClient>} (authenticated endpoint) or,
     * @throws {Error} if application is not authenticated.
     */
    static get authClient() {
        if (MoonGraphQL._authClient) {
            return MoonGraphQL._authClient;

        } else {
            try {
                MoonGraphQL._authClient = new AWSAppSyncClient(AppSyncAuthConfig);
                return MoonGraphQL._authClient;
            } catch (error) {
                MoonGraphQL._authClient = null;
                throw error;
            }
        }
    };

    /**
     * The public AppSync client.
     * @return {AWSAppSyncClient}
     */
    static get publicClient() {
        return MoonGraphQL._publicClient;
    }
}

export default MoonGraphQL;
