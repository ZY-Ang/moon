/*
 * Copyright (c) 2018 moon
 */

const {AuthenticatedClient, PublicClient, WebsocketClient} = require("gdax");

// DO NOT EXPORT SECRETS UNLESS ABSOLUTELY NECESSARY. PREVENTS OTHER THREADS FROM ACCESSING THIS FILE.

/**
 * The REST endpoint for CoinbasePro's API
 * @type {string}
 */
const ENDPOINT_REST_COINBASE_PRO = 'https://api.pro.coinbase.com';
// const ENDPOINT_REST_COINBASE_PRO_SANDBOX https://api-public.sandbox.pro.coinbase.com

/**
 * Moon API Key for instantiating a CoinbasePro client
 * @type {string}
 */
const API_KEY_PRODUCTION = 'd95c464fe72a443077d99d11fd79408c';
const API_KEY_DEVELOPMENT = '34fa68b5c03c5fc93134a7f0872a9cae';
const API_KEY = process.env.NODE_ENV === 'production'
    ? API_KEY_PRODUCTION
    : API_KEY_DEVELOPMENT;

/**
 * Moon API Passphrase for instantiating a CoinbasePro client
 * @type {string}
 */
const API_PASSPHRASE_PRODUCTION = '79mxbffa74g';
const API_PASSPHRASE_DEVELOPMENT = '183g8be9zmk';
const API_PASSPHRASE = process.env.NODE_ENV === 'production'
    ? API_PASSPHRASE_PRODUCTION
    : API_PASSPHRASE_DEVELOPMENT;

/**
 * Moon API Secret for instantiating a CoinbasePro client
 * @type {string} {base64}
 */
const API_SECRET_PRODUCTION = 'J6AG2sPjhSLQCh01T/qD4dhwvVw2pqPB13I1hImhwe45/uw0HECB4r1fduz/pgOeBXoIMe3HS9EZpYB1mvbxNw==';
const API_SECRET_DEVELOPMENT = 'JCcfP9wTbMz9fBp8jp1A/FiYWe63SU7+8EhRSIGFNse+/dp0koUTBmj98Gtd1+stXVINVZKRMEUFELTeE1B1sg==';
const API_SECRET = process.env.NODE_ENV === 'production'
    ? API_SECRET_PRODUCTION
    : API_SECRET_DEVELOPMENT;

export const getAuthenticatedClient = () => new AuthenticatedClient(
    API_KEY,
    API_SECRET,
    API_PASSPHRASE,
    ENDPOINT_REST_COINBASE_PRO
);

export const getPublicClient = () => new PublicClient(ENDPOINT_REST_COINBASE_PRO);
