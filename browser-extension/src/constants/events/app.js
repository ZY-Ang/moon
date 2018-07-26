/*
 * Copyright (c) 2018 moon
 */

// This file contains the events and request types that are EMITTED FROM THE CONTENT SCRIPT.

// --------------------- Launch Web Auth Flow ---------------------
/** Used to request an injection of the moon extension onto the page */
export const REQUEST_LAUNCH_WEB_AUTH_FLOW = "MOON_LAUNCH_AUTH_FLOW";

/** Used to notify of sign in via Cognito email and password */
export const TYPE_COGNITO_SIGN_IN = "CognitoSignIn";
/** Used to notify of sign up via Cognito email and password */
export const TYPE_COGNITO_SIGN_UP = "CognitoSignUp";
/** Used to notify of authentication via Facebook */
export const TYPE_FACEBOOK = "Facebook";
/** Used to notify of authentication via Google */
export const TYPE_GOOGLE = "Google";
/** Used to notify of authentication via Login With Amazon */
export const TYPE_AMAZON = "Amazon";
