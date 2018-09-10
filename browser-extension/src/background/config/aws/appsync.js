/*
 * Copyright (c) 2018 moon
 */

import AWS from "./AWS";
import {AUTH_TYPE} from "aws-appsync/lib/link/auth-link";
import AuthUser from "../../auth/AuthUser";

const ENDPOINT_APPSYNC_MOON_PRODUCTION = "https://rkupgarzrnfvtflhrlmrmkvb5i.appsync-api.us-east-1.amazonaws.com/graphql";
const ENDPOINT_APPSYNC_MOON_DEVELOPMENT = "https://iq3pqooobre5ziyhu2ogpn6ndm.appsync-api.us-east-1.amazonaws.com/graphql";

export const ENDPOINT_APPSYNC_MOON_AUTHENTICATED = (process.env.BUILD_ENV === 'production')
    ? ENDPOINT_APPSYNC_MOON_PRODUCTION
    : ENDPOINT_APPSYNC_MOON_DEVELOPMENT;

class AppSyncConfig {
    /**
     * Gets a authenticated configuration for AWS AppSync clients
     *
     * @return {Promise<{url: string, region: string, auth: {type: AUTH_TYPE.OPENID_CONNECT, jwtToken: *}, disableOffline: boolean}>}
     */
    static getAuthConfig = async () => ({
        url: ENDPOINT_APPSYNC_MOON_AUTHENTICATED,
        region: AWS.config.region,
        auth: {
            type: AUTH_TYPE.OPENID_CONNECT,
            jwtToken: await AuthUser.getInstance().getRefreshedIdJWToken()
        },
        disableOffline: true
    });

    // TODO: New endpoint for unauthenticated requests
    // static getNonAuthConfig = async () => ({
    //     url: ENDPOINT_APPSYNC_MOON_UNAUTHENTICATED,
    //     region: AWS.config.region,
    //     auth: {
    //         type: AUTH_TYPE.OPENID_CONNECT,
    //         jwtToken: await AuthUser.getInstance().getRefreshedIdJWToken()
    //     },
    //     disableOffline: true
    // });
}

export default AppSyncConfig;
