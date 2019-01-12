/*
 * Copyright (c) 2018 moon
 */

import {decode} from "jsonwebtoken";
import {URL_OAUTH_SERVER} from "./url";
import backgroundLogger from "../utils/BackgroundLogger";

/**
 * Verifies a JWT on the client without
 * verifying signature against public key
 *
 * @see {@link https://github.com/auth0/node-jsonwebtoken#jwtdecodetoken--options}
 */
export const isValidJWT = (token) => {
    try {
        const {iss} = decode(token);
        if (iss !== URL_OAUTH_SERVER) {
            // noinspection ExceptionCaughtLocallyJS
            throw new Error(`Invalid Token Issuer: ${iss}`);
        }
        return true;

    } catch (err) {
        backgroundLogger.error("isValidJWT exception: ", err);
        return false;
    }
};

/** @class */
class JwtToken {
    /**
     * Constructs a new CognitoJwtToken object
     * @param {string=} token The JWT token.
     */
    constructor(token) {
        // Assign object
        this.encodedJwt = token || '';
        this.payload = this.decodePayload();
    }

    /**
     * @returns {string} the record's token.
     */
    getJwtToken() {
        return this.encodedJwt;
    }

    /**
     * @returns {string} the token's subject (sub member).
     */
    getSub() {
        return this.payload.sub;
    }

    /**
     * @returns {string} the token's email (email member).
     */
    getEmail() {
        return this.payload.email;
    }

    /**
     * @returns {int} the token's expiration (exp member).
     */
    getExpiration() {
        return this.payload.exp;
    }

    /**
     * @returns {int} the token's "issued at" (iat member).
     */
    getIssuedAt() {
        return this.payload.iat;
    }

    /**
     * @returns {object} the token's payload.
     */
    decodePayload() {
        try {
            return decode(this.encodedJwt);
        } catch (err) {
            return {};
        }
    }
}

export default JwtToken;
