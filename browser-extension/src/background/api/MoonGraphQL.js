/*
 * Copyright (c) 2018 moon
 */

import AWSAppSyncClient from "aws-appsync";
import AuthUser from "../auth/AuthUser";
import {AppSyncAuthConfig, AppSyncPublicConfig} from "../config/aws/appsync";

/**
 * Utility class to obtain graphql client for application.
 */
class MoonGraphQL {
    /** @readonly */
    static _authClient = null;

    /** @readonly */
    static _publicClient = null; // TODO: new AWSAppSyncClient(AppSyncPublicConfig) once AppSyncPublicConfig has been configured properly

    /**
     * Remove {@static _authClient} instance on sign out
     */
    static signOut = () => {
        MoonGraphQL._authClient = null;
    };

    /**
     * The authenticated AppSync client with valid credentials.
     * Automatically refreshes JWT them when necessary.
     *
     * @returns {AWSAppSyncClient} (authenticated endpoint) or,
     * @throws {Error} if application is not authenticated.
     */
    static async get authClient() {
        const authUser = await AuthUser.getCurrent();
        if (!authUser) {
            throw new Error("User is not authenticated");

        } else if (MoonGraphQL._authClient) {
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
