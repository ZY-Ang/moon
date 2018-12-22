/*
 * Copyright (c) 2018 moon
 */

import {stringify} from "query-string";
import {AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET} from "../config/Auth0/client";
import {AUTH0_AUDIENCE} from "../config/Auth0/api";
import {URL_OAUTH_REDIRECT, URL_SIGN_OUT_REDIRECT} from "../../constants/url";
import store from "../redux/store";
import {ACTION_SET_CSRF_STATE} from "../redux/reducers/session";
import {generate as randomstring} from "randomstring";

/**
 * The unqualified domain URL where the OAuth Server/hosted UI is located
 */
export const DOMAIN_OAUTH_SERVER = 'paywithmoon.auth0.com';

/**
 * The fully qualified URL where the OAuth Server/hosted UI is located
 */
export const URL_OAUTH_SERVER = `https://${DOMAIN_OAUTH_SERVER}/`;

/**
 * The fully qualified URL where the Public key is located
 */
export const URL_OAUTH_SERVER_ISS = `${URL_OAUTH_SERVER}.well-known/jwks.json`;

/**
 * Appends the CSRF state to the params
 * @param params
 * @returns {*}
 */
export const getCsrfStateAppendedParams = (params) => {
    const csrfState = randomstring(8);
    console.log('NEW CSRF STATE', csrfState);
    store.dispatch({
        type: ACTION_SET_CSRF_STATE,
        csrfState
    });
    return {
        ...params,
        state: csrfState
    };
};

/**
 * The default OAuth spec parameters to be sent to the AWS Cognito hosted UI
 * @type {{response_type: string, client_id: string, redirect_uri: string}}
 */
const DEFAULT_PARAMS = {
    response_type: 'code',
    audience: AUTH0_AUDIENCE,
    scope: 'email profile openid offline_access',
    client_id: AUTH0_CLIENT_ID,
    redirect_uri: URL_OAUTH_REDIRECT
    // access_type: 'offline'
};

/** The overridden params for a standard sign in */
export const STANDARD_SIGN_IN_PARAMS = {
    ...DEFAULT_PARAMS
};

/** The overridden params for a standard sign up */
export const STANDARD_SIGN_UP_PARAMS = {
    ...DEFAULT_PARAMS,
    initialScreen: 'signUp'
};

/** The overridden params for a password reset */
export const STANDARD_RESET_PASSWORD_PARAMS = {
    ...DEFAULT_PARAMS,
    initialScreen: 'forgotPassword'
};

/** The overridden params for an authentication via Facebook */
export const FACEBOOK_AUTH_PARAMS = {
    ...DEFAULT_PARAMS,
    connection: 'facebook'
};

/** The overridden params for a authentication via Google */
export const GOOGLE_AUTH_PARAMS = {
    ...DEFAULT_PARAMS,
    connection: 'google-oauth2'
};

/** The overridden params for a authentication via Amazon */
export const AMAZON_AUTH_PARAMS = {
    ...DEFAULT_PARAMS,
    connection: 'amazon'
};

/**
 * Body of the POST request used in stage 2 of the OAuth Authorization Code Grant Flow.
 *
 * @param {string} code
 * @return {{
 *      grant_type: string,
 *      scope: string,
 *      redirect_uri: string,
 *      client_secret: string,
 *      client_id: string,
 *      code: string
 * }}
 */
export const getURLFlowParams = (code) => ({
    grant_type: 'authorization_code',
    scope: 'email openid profile',
    redirect_uri: URL_OAUTH_REDIRECT,
    client_secret: AUTH0_CLIENT_SECRET,
    client_id: AUTH0_CLIENT_ID,
    code: code
});
/**
 * Body of the POST request used in refreshing tokens from the OAuth server.
 *
 * @param {string} refreshToken
 * @return {{
 *      grant_type: string,
 *      client_id: string,
 *      client_secret: string,
 *      refresh_token: string
 * }}
 */
export const getRefreshTokenParams = (refreshToken) => ({
    grant_type: 'refresh_token',
    client_id: AUTH0_CLIENT_ID,
    client_secret: AUTH0_CLIENT_SECRET,
    refresh_token: refreshToken
});
/**
 * The endpoint of the OAuth server in stage 2 of the Authorization Code Grant Flow.
 * @type {string} POST REST endpoint
 *
 * OR
 *
 * The endpoint of the OAuth server to obtain new tokens, using a refresh token
 */
export const URL_TOKEN_FLOW = `${URL_OAUTH_SERVER}oauth/token`;

/**
 * Body of the POST request used to request to send a password reset email from the OAuth server
 * @param email {string} - of the user
 * @returns {{client_id: string, connection: string, email: string}}
 */
export const getPasswordResetFlowParams = (email) => ({
    client_id: AUTH0_CLIENT_ID,
    client_secret: AUTH0_CLIENT_SECRET,
    connection: 'Username-Password-Authentication',
    email
});
/**
 * The endpoint of the OAuth server to send a password reset email
 * @type {string} POST REST endpoint
 */
export const URL_PASSWORD_RESET = `${URL_OAUTH_SERVER}dbconnections/change_password`;

/**
 * The logout URI of the OAuth Server
 */
const SIGN_OUT_PARAMS = {
    client_id: AUTH0_CLIENT_ID,
    returnTo: URL_SIGN_OUT_REDIRECT
};
/**
 * The logout endpoint
 */
export const URL_SIGN_OUT = `${URL_OAUTH_SERVER}v2/logout?${stringify(SIGN_OUT_PARAMS)}`;

/**
 * Body of the POST request used in refreshing tokens from the OAuth server.
 *
 * @param {string} refreshToken
 * @return {{
 *      client_id: string,
 *      client_secret: string,
 *      token: string
 * }}
 */
export const getRevokeTokenParams = (refreshToken) => ({
    client_id: AUTH0_CLIENT_ID,
    client_secret: AUTH0_CLIENT_SECRET,
    token: refreshToken
});
/**
 * The revoke token endpoint
 */
export const URL_REVOKE_REFRESH_TOKENS = `${URL_OAUTH_SERVER}oauth/revoke`;
