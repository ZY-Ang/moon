/*
 * Copyright (c) 2018 moon
 */

// payments@paywithmoon.com Coinbase Pro API production info
const EMAIL_PRODUCTION = "payments@paywithmoon.com";
// TODO (Ken): create another Coinbase account for dev and update this info
// payments@paywithmoon.com Coinbase Pro API development info
const EMAIL_DEVELOPMENT = "payments@paywithmoon.com";

/* Saving the Coinbase wallet ids here prevents us from making an additional call to the API
 * These ids do not change unless we switch to another account */
const WALLETS_PRODUCTION = {
    ETH: '376582d6-1afc-5775-ae4b-39226c4b948d',
    BTC: '1be8268c-6321-5277-86b7-14a65b78d541',
    BCH: '748061f1-433a-532f-896b-0787239961a7',
    LTC: '40f8d107-dc1e-5e22-adce-8c702fedba83',
    ETC: '2ffa35f1-2489-5db9-bdaa-939df47472e2'
};
const WALLETS_DEVELOPMENT = {
    ETH: '95671473-4dda-5264-a654-fc6923e8a335',
    BTC: '95671473-4dda-5264-a654-fc6923e8a334',
    BCH: '95671473-4dda-5264-a654-fc6923e8a337',
    LTC: '95671473-4dda-5264-a654-fc6923e8a336',
    ETC: '' // There is no ETC sandbox wallet :(
};

const productionConfig = {
    EMAIL: EMAIL_PRODUCTION,
    WALLETS: WALLETS_PRODUCTION
};

const developmentConfig = {
    EMAIL: EMAIL_DEVELOPMENT,
    WALLETS: WALLETS_DEVELOPMENT
};

module.exports = process.env.NODE_ENV === 'production'
    ? productionConfig
    : developmentConfig;
