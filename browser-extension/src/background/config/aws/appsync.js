/*
 * Copyright (c) 2018 moon
 */

import AWS from "./AWS";
import {AUTH_TYPE} from "aws-appsync/lib/link/auth-link";
import AuthUser from "../../auth/AuthUser";

const ENDPOINT_APPSYNC_MOON_AUTH_PRODUCTION = "https://wti3lpxmjzezzbsg5sonlzipae.appsync-api.us-east-1.amazonaws.com/graphql";
const ENDPOINT_APPSYNC_MOON_AUTH_DEVELOPMENT = "https://iimjzpnjsvgctmfags3h7x5xem.appsync-api.us-east-1.amazonaws.com/graphql";
/**
 * Authenticated graphql API endpoint for AWS AppSync
 * @type {string}
 */
const ENDPOINT_APPSYNC_MOON_AUTH = (process.env.BUILD_ENV === 'production')
    ? ENDPOINT_APPSYNC_MOON_AUTH_PRODUCTION
    : ENDPOINT_APPSYNC_MOON_AUTH_DEVELOPMENT;

const ENDPOINT_APPSYNC_MOON_PUBLIC_PRODUCTION = ''; // TODO: implement
const ENDPOINT_APPSYNC_MOON_PUBLIC_DEVELOPMENT = ''; // TODO: implement
/**
 * Public graphql API endpoint for AWS AppSync
 * @type {string}
 */
const ENDPOINT_APPSYNC_MOON_PUBLIC = (process.env.BUILD_ENV === 'production')
    ? ENDPOINT_APPSYNC_MOON_PUBLIC_PRODUCTION
    : ENDPOINT_APPSYNC_MOON_PUBLIC_DEVELOPMENT;

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
        jwtToken: () => AuthUser.getInstance().getRefreshedIdJWToken()
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
        apiKey: "" // TODO: implement
    }
};

export default AppSyncPublicConfig;
