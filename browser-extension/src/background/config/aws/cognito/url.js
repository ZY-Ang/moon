/*
 * Copyright (c) 2018 moon
 */

import {COGNITO_CLIENT_ID} from "./userpool";
import {stringify} from "query-string";

/**
 * The URL where the AWS Cognito hosted UI is located
 */
const URL_OAUTH_SERVER = 'https://moon.auth.us-east-1.amazoncognito.com/';

/**
 * The URL that AWS Cognito hosted UI should redirect to let chrome handle OAuth
 */
export const URL_REDIRECT = chrome.identity.getRedirectURL(); // alternatively, `https://${extensionId}.chromiumapp.org/`;

/**
 * The default OAuth spec parameters to be sent to the AWS Cognito hosted UI
 * @type {{response_type: string, client_id: string, redirect_uri: string}}
 */
const DEFAULT_PARAMS = {
    response_type: 'code',
    client_id: COGNITO_CLIENT_ID,
    redirect_uri: URL_REDIRECT
};

/** The overridden params for a sign in via Cognito */
const COGNITO_SIGN_IN_PARAMS = {
    ...DEFAULT_PARAMS,
    identity_provider: 'COGNITO'
};
/**
 * The Cognito Sign IN URL for the AWS Cognito hosted UI
 */
export const URL_COGNITO_SIGN_IN = `${URL_OAUTH_SERVER}oauth2/authorize?${stringify(COGNITO_SIGN_IN_PARAMS)}`;

/**
 * The Cognito Sign UP URL for the AWS Cognito hosted UI
 */
export const URL_COGNITO_SIGN_UP = `${URL_OAUTH_SERVER}signup?${stringify(DEFAULT_PARAMS)}`;

/** The overridden params for a authentication via Facebook */
const FACEBOOK_AUTH_PARAMS = {
    ...DEFAULT_PARAMS,
    identity_provider: 'Facebook'
};
/**
 * The Facebook Auth URL for the AWS Cognito hosted UI
 */
export const URL_FACEBOOK_AUTH = `${URL_OAUTH_SERVER}oauth2/authorize?${stringify(FACEBOOK_AUTH_PARAMS)}`;

/** The overridden params for a authentication via Google */
const GOOGLE_AUTH_PARAMS = {
    ...DEFAULT_PARAMS,
    identity_provider: 'Google'
};
/**
 * The Google Auth URL for the AWS Cognito hosted UI
 */
export const URL_GOOGLE_AUTH = `${URL_OAUTH_SERVER}oauth2/authorize?${stringify(GOOGLE_AUTH_PARAMS)}`;

/** The overridden params for a authentication via Amazon */
const AMAZON_AUTH_PARAMS = {
    ...DEFAULT_PARAMS,
    identity_provider: 'LoginWithAmazon'
};
/**
 * The Amazon Auth URL for the AWS Cognito hosted UI
 */
export const URL_AMAZON_AUTH = `${URL_OAUTH_SERVER}oauth2/authorize?${stringify(AMAZON_AUTH_PARAMS)}`;

/**
 * The AWS Cognito Hosted UI Server URL to retrieve tokens
 * via a post method after receiving an authorization code grant.
 */
export const URL_TOKEN_FLOW = `${URL_OAUTH_SERVER}oauth2/token`;
