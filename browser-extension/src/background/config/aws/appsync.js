/*
 * Copyright (c) 2018 moon
 */

import AWS from "./AWS";
import {AUTH_TYPE} from "aws-appsync/lib/link/auth-link";
import AuthUser from "../../auth/AuthUser";

/**
 * Authenticated graphql API endpoint for AWS AppSync
 * @type {string}
 */
const ENDPOINT_APPSYNC_MOON_AUTH = process.env.AWS_APPSYNC_ENDPOINT_AUTH;

/**
 * Public graphql API endpoint for AWS AppSync
 * @type {string}
 */
const ENDPOINT_APPSYNC_MOON_PUBLIC = process.env.AWS_APPSYNC_ENDPOINT_PUBLIC;

/**
 * Public graphql API ID for AWS AppSync
 * @type {string}
 */
const API_ID_APPSYNC_MOON_PUBLIC = process.env.AWS_APPSYNC_API_ID_PUBLIC;

/**
 * Public graphql API Key for AWS AppSync
 * @type {string}
 */
const API_KEY_APPSYNC_MOON_PUBLIC = process.env.AWS_APPSYNC_API_KEY_PUBLIC;

/**
 * Dynamic configuration for AWS AppSync authenticated client.
 *
 * @type {{url: string, region: string, auth: {type: AUTH_TYPE.OPENID_CONNECT, jwtToken: (function(): Promise<*>)}, disableOffline: boolean}}
 */
export const AppSyncAuthConfig = {
    url: ENDPOINT_APPSYNC_MOON_AUTH,
    region: AWS.config.region,
    auth: {
        type: AUTH_TYPE.OPENID_CONNECT,
        // Jwt automatically refreshes according to promise implementation.
        jwtToken: async () => {
            const authUser = await AuthUser.getCurrent();
            if (!!authUser) {
                return authUser.getRefreshedIdJWToken();
            } else {
                throw new Error("AppSync auth configuration error: User is not authenticated or waiting to authenticate");
            }
        }
    },
    disableOffline: true
};

/**
 * Configuration for AWS AppSync public client
 *
 * @type {{url: string, region: string, auth: {type: AUTH_TYPE.API_KEY, apiKey: string}}}
 */
export const AppSyncPublicConfig = {
    url: ENDPOINT_APPSYNC_MOON_PUBLIC,
    region: AWS.config.region,
    auth: {
        type: AUTH_TYPE.API_KEY,
        apiKey: API_KEY_APPSYNC_MOON_PUBLIC
    },
    disableOffline: true
};

export default AppSyncPublicConfig;
