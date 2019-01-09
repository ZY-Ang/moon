/*
 * Copyright (c) 2018 moon
 */

import JwtToken, {isValidJWT} from "./JwtToken";
import Storage from "../browser/Storage";
import AWS from "../config/aws/AWS";
import {
    getPasswordResetFlowParams,
    getRefreshTokenParams,
    getRevokeTokenParams,
    URL_PASSWORD_RESET,
    URL_REVOKE_REFRESH_TOKENS,
    URL_SIGN_OUT,
    URL_TOKEN_FLOW
} from "./url";
import axios from "axios";
import {WEBIDENTITY_IAM_ROLE_ARN} from "../config/aws/iam";
import {getUser} from "../api/user";
import MoonGraphQL from "../api/MoonGraphQL";

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

    getIdToken = () => this.idToken;
    getAccessToken = () => this.accessToken;
    getRefreshToken = () => this.refreshToken;

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

    static getUuid = () => {
        try {
            return AuthUser.getInstance().getIdToken().getSub();
        } catch (error) {
            return null;
        }
    };

    static getEmail = () => {
        try {
            return AuthUser.getInstance().getIdToken().getEmail();
        } catch (error) {
            return null;
        }
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
        if (this.isSessionValid()) {
            await this.setAWSCredentials();
        } else {
            // refresh session and set new AWS credentials
            await this.refreshSession();
        }

        return this.setTokensToStorage();
    };

    getRefreshedIdJWToken = async () => {
        if (!this.isSessionValid()) {
            // refresh session
            await this.refreshSession();
        }
        return this.getIdToken().getJwtToken();
    };

    setAWSCredentials = () => {
        console.log("setAWSCredentials");
        let credentials = new AWS.WebIdentityCredentials({
            RoleArn: WEBIDENTITY_IAM_ROLE_ARN,
            WebIdentityToken: this.getIdToken().getJwtToken()
            // TODO: (maybe) Implement RoleSessionName for downstream validation
        });
        AWS.config.update({credentials});
        return AWS.config.credentials.getPromise()
            .catch(err => console.error("setAWSCredentials: AWS.config.credentials.getPromise exception: ", err));
    };

    /**
     * Gets refreshed AWS credentials
     * @return {Promise<Credentials | CredentialsOptions>}
     */
    getAWSCredentials = async () => {
        if (AWS.config.credentials) {
            await AWS.config.credentials.getPromise();
        } else {
            await this.setAWSCredentials();
        }
        return AWS.config.credentials;
    };

    resetPassword = () => {
        const email = AuthUser.getEmail();
        const body = getPasswordResetFlowParams(email);
        return axios.post(URL_PASSWORD_RESET, body);
    };

    signOut = () => {
        AuthUser.setInstance(null);
        MoonGraphQL.signOut();
        return this.clearTokensFromStorage()
            .then(() => axios.get(URL_SIGN_OUT))
            .then(response => {
                console.log(`Cleared cache via OAuth logout endpoint`);
                return response;
            });
    };

    globalSignOut = () => {
        const body = getRevokeTokenParams(this.refreshToken);
        MoonGraphQL.signOut();
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
     * Returns the current {@class AuthUser} instance for display on the front end
     */
    static trim = async () => {
        const authUser = await AuthUser.getCurrent();
        if (!authUser) {
            return null;
        }
        const {data} = await getUser();
        const coinbaseWallets = (data.user.coinbaseInfo && data.user.coinbaseInfo.wallets && !!data.user.coinbaseInfo.wallets.length)
            ? data.user.coinbaseInfo.wallets
            : [];
        return {
            name: data.user.identity.claims.nickname || data.user.identity.claims.name || data.user.identity.claims.email,
            email: data.user.identity.claims.email,
            email_verified: data.user.identity.claims.email_verified,
            onboardingSkipExpiry: data.user.signUpState && data.user.signUpState.onboardingSkipExpiry,
            picture: data.user.identity.claims.picture,
            wallets: coinbaseWallets
        };
    };

    /**
     * Sets a serializable version of authUser into the browser storage API
     */
    setTokensToStorage = async () => {
        return Storage.local.set({
            authUser: {
                access_token: this.accessToken.encodedJwt,
                id_token: this.idToken.encodedJwt,
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
}

export default AuthUser;
