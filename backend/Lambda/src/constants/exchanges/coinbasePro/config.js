/*
 * Copyright (c) 2018 moon
 */


// payments@paywithmoon.com Coinbase Pro API production info
const COINBASE_ACCOUNT_EMAIL_PRODUCTION = "payments@paywithmoon.com";
const COINBASE_PRO_KEY_PRODUCTION = 'd95c464fe72a443077d99d11fd79408c';
const COINBASE_PRO_PASSPHRASE_PRODUCTION = '79mxbffa74g';
const COINBASE_PRO_SECRET_PRODUCTION = 'J6AG2sPjhSLQCh01T/qD4dhwvVw2pqPB13I1hImhwe45/uw0HECB4r1fduz/pgOeBXoIMe3HS9EZpYB1mvbxNw==';
/* Saving the Coinbase wallet ids here prevents us from making an additional call to the API
 * These ids do not change unless we switch to another account */
const COINBASE_WALLET_IDS_PRODUCTION = {
    ETH: '376582d6-1afc-5775-ae4b-39226c4b948d',
    BTC: '1be8268c-6321-5277-86b7-14a65b78d541',
    BCH: '748061f1-433a-532f-896b-0787239961a7',
    LTC: '40f8d107-dc1e-5e22-adce-8c702fedba83',
    ETC: '2ffa35f1-2489-5db9-bdaa-939df47472e2'
};

// payments@paywithmoon.com Coinbase Pro API sandbox info
const COINBASE_ACCOUNT_EMAIL_DEVELOPMENT = "payments@paywithmoon.com";
const COINBASE_PRO_KEY_DEVELOPMENT = '34fa68b5c03c5fc93134a7f0872a9cae';
const COINBASE_PRO_PASSPHRASE_DEVELOPMENT = '183g8be9zmk';
const COINBASE_PRO_SECRET_DEVELOPMENT = 'JCcfP9wTbMz9fBp8jp1A/FiYWe63SU7+8EhRSIGFNse+/dp0koUTBmj98Gtd1+stXVINVZKRMEUFELTeE1B1sg==';
const COINBASE_WALLET_IDS_DEVELOPMENT = {
    ETH: '95671473-4dda-5264-a654-fc6923e8a335',
    BTC: '95671473-4dda-5264-a654-fc6923e8a334',
    BCH: '95671473-4dda-5264-a654-fc6923e8a337',
    LTC: '95671473-4dda-5264-a654-fc6923e8a336',
    ETC: '' // There is no ETC sandbox wallet :(
};

const COINBASE_PRO_API_URI = 'https://api.pro.coinbase.com';
const COINBASE_PRO_SANDBOX_URI = 'https://api-public.sandbox.pro.coinbase.com';

module.exports.coinbaseProUri = process.env.NODE_ENV === 'production'
    ? COINBASE_PRO_API_URI
    : COINBASE_PRO_SANDBOX_URI;

module.exports.coinbaseProKey = process.env.NODE_ENV === 'production'
    ? COINBASE_PRO_KEY_PRODUCTION
    : COINBASE_PRO_KEY_DEVELOPMENT;

module.exports.coinbaseProPassphrase = process.env.NODE_ENV === 'production'
    ? COINBASE_PRO_PASSPHRASE_PRODUCTION
    : COINBASE_PRO_PASSPHRASE_DEVELOPMENT;

module.exports.coinbaseProSecret = process.env.NODE_ENV === 'production'
    ? COINBASE_PRO_SECRET_PRODUCTION
    : COINBASE_PRO_SECRET_DEVELOPMENT;

module.exports.coinbaseAccountEmail = process.env.NODE_ENV === 'production'
    ? COINBASE_ACCOUNT_EMAIL_PRODUCTION
    : COINBASE_ACCOUNT_EMAIL_DEVELOPMENT;

module.exports.coinbaseWalletIds = process.env.NODE_ENV === 'production'
    ? COINBASE_WALLET_IDS_PRODUCTION
    : COINBASE_WALLET_IDS_DEVELOPMENT;


// todo: Ken: create another Coinbase account for dev and update this info