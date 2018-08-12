/*
 * Copyright (c) 2018 moon
 */

import JwtToken, {isValidJWT} from "./JwtToken";
import Storage from "../browser/Storage";
import AWS from "../config/aws/AWS";
import {IDENTITY_POOL_ID} from "../config/aws/cognito/identitypool";
import {
    DOMAIN_OAUTH_SERVER,
    getRefreshTokenParams,
    getRevokeTokenParams,
    URL_REVOKE_REFRESH_TOKENS,
    URL_SIGN_OUT,
    URL_TOKEN_FLOW
} from "./url";
import axios from "axios";

/**
 * Singleton {@class AuthUser}
 */
class AuthUser {
    /**
     * Singleton instance for the currently signed in user
     * @type {AuthUser|null}
     */
    static authUserInstance = null;

    /** @type {JwtToken|null} */
    accessToken = null;
    /** @type {JwtToken|null} */
    idToken = null;
    /** @type {string|null} */
    refreshToken = null;

    constructor(params) {
        if (!AuthUser.isValidTokens(params)) {

            AuthUser.setInstance(null);
            throw new Error("Tokens are not valid");

        } else {
            this.accessToken = new JwtToken(params.access_token);
            this.idToken = new JwtToken(params.id_token);
            this.refreshToken = params.refresh_token;
            AuthUser.setInstance(this);
        }
    }

    /**
     * @returns {boolean} {@code true} if
     * {@param tokens} used to instantiate
     * the {@class AuthUser} are valid.
     */
    static isValidTokens = (tokens) => {
        const {access_token, id_token, refresh_token} = tokens;
        if (!tokens || tokens.constructor !== Object) {
            console.error("tokens do not exist or are malformed");

        } else if (!access_token || !isValidJWT(access_token)) {
            console.error("access_token does not exist or is invalid");

        } else if (!id_token || !isValidJWT(id_token)) {
            console.error("id_token does not exist or is invalid");

        } else if (!refresh_token || refresh_token.constructor !== String) {
            console.error("refresh_token does not exist or is invalid");

        } else {
            return true;
        }
    };

    static getInstance = () => {
        return AuthUser.authUserInstance;
    };

    /**
     * Gets the current auth user and refreshes the session if necessary.
     */
    static getCurrent = async () => {
        if (!!AuthUser.authUserInstance
            && AuthUser.authUserInstance.isSessionValid()
        ) {
            return AuthUser.getInstance();
        } else {
            return Storage.local.get('authUser')
                .then(({authUser}) => {
                    if (!!authUser) {
                        const userFromStorage = new AuthUser(authUser);
                        return userFromStorage.refreshSession();

                    } else {
                        return null;
                    }
                });
        }
    };

    static setInstance = (authUser) => {
        AuthUser.authUserInstance = authUser;
        return authUser;
    };

    signIn = async () => {
        console.log("signIn");
        if (this.isSessionValid()) {
            this.setAWSCredentials();
        } else {
            // refresh session and set new AWS credentials
            await this.refreshSession();
            this.setAWSCredentials();
        }

        return this.setTokensToStorage();
    };

    setAWSCredentials = () => {
        console.log("setAWSCredentials");
        let credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: IDENTITY_POOL_ID,
            Logins: {[DOMAIN_OAUTH_SERVER]: this.idToken.getJwtToken()}
        });
        AWS.config.update({credentials});
    };

    signOut = () => {
        AuthUser.setInstance(null);
        return this.clearTokensFromStorage()
            .then(() => axios.get(URL_SIGN_OUT))
            .then(response => {
                console.log(`Cleared cache via OAuth logout endpoint with response.data: "${response.data}"`);
                return response;
            });
    };

    globalSignOut = () => {
        const body = getRevokeTokenParams(this.refreshToken);
        return this.signOut()
            .then(() => axios.post(URL_REVOKE_REFRESH_TOKENS, body));
    };

    isSessionValid = () => {
        const now = Math.floor(new Date() / 1000);

        // TODO: (in the faraway future) Handle clockdrift
        return now < this.accessToken.getExpiration()
            && now < this.idToken.getExpiration();
    };

    refreshSession = () => {
        const body = getRefreshTokenParams(this.refreshToken);
        return axios.post(URL_TOKEN_FLOW, body)
            .then(({data}) => {
                console.log("Retrieved new tokens");
                if (!AuthUser.isValidTokens({...data, refresh_token: this.refreshToken})) {
                    throw new Error("Tokens are not valid");

                } else {
                    this.accessToken = new JwtToken(data.access_token);
                    this.idToken = new JwtToken(data.id_token);
                    AuthUser.setInstance(this);
                    this.setAWSCredentials();
                    return this;
                }
            });
    };

    /**
     * Returns a authUser object for display on the front end
     */
    trim = () => {
        const payload = this.idToken.decodePayload();
        return {
            name: payload.name || payload.email,
            email: payload.email,
            picture: payload.picture,
            email_verified: payload.email_verified
        }
    };

    /**
     * Sets a serializable version of authUser into the browser storage API
     */
    setTokensToStorage = async () => {
        return Storage.local.set({
            authUser: {
                access_token: this.accessToken.raw,
                id_token: this.idToken.raw,
                refresh_token: this.refreshToken
            }
        });
    };

    clearTokensFromStorage = () => {
        return Storage.local.get('authUser')
            .then(({authUser}) => {
                if (!!authUser) {
                    return Storage.local.remove('authUser');
                } else {
                    throw new Error("User is not signed in");
                }
            });
    };

    getRefreshedAWSCredentials = () => new Promise((resolve, reject) =>
        AWS.config.credentials.get(err => {
            if (err) {
                reject(err);
            } else {
                resolve(AWS.config.credentials);
            }
        })
    )
        .catch(this.setAWSCredentials);
}

export default AuthUser;
