/*
 * Copyright (c) 2018 moon
 */

// This file contains the events and request types that are emitted from the content script.

/** Used to request an injection of the moon extension onto the page */
export const REQUEST_LAUNCH_SIGN_IN_FLOW = "MOON_LAUNCH_AUTH_FLOW";

export const TYPE_COGNITO_SIGN_IN = "CognitoSignIn";
export const TYPE_COGNITO_SIGN_UP = "CognitoSignUp";
export const TYPE_FACEBOOK = "Facebook";
export const TYPE_GOOGLE = "Google";
export const TYPE_AMAZON = "Amazon";
