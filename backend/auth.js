/*
 * Copyright (c) 2018 moon
 */


import {verify as doVerifyJwtCb} from "jsonwebtoken";
import JwksClient from "jwks-rsa";
import {URL_OAUTH_SERVER, URL_OAUTH_SERVER_ISS} from "../browser-extension/src/background/auth/url";

const jwksClient = new JwksClient({
    jwksUri: URL_OAUTH_SERVER_ISS
});

const getPublicKey = (header, callback) => {
    jwksClient.getSigningKey(header.kid, (err, key) => {
        if (err) {
            callback(err);
        }
        const signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
    })
};

/**
 * Verifies a {@param token {string}} asynchronously
 *
 * @see {@link https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback}
 */
const isValidJWT = async (token) => {
    try {
        const options = {
            algorithms: ['RS256'],
            audience: [
                'FsOYup3U7OUWml51A4HKPBEjYNsdIQJC',
                'UGF5V2l0aE1vb25BdXRoQVBJCg'
            ],
            issuer: URL_OAUTH_SERVER
        };
        return new Promise((resolve, reject) => {
            doVerifyJwtCb(token, getPublicKey, options, (err, payload) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(payload);
                }
            });
        });
    } catch(err) {
        return {};
    }
};
