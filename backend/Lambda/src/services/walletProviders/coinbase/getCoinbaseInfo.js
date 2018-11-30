/*
 * Copyright (c) 2018 moon
 */
import {Client as CoinbaseClient} from "coinbase";
import getCoinbaseWallets from "./getCoinbaseWallets";
import getCoinbaseCurrentUser from "./getCoinbaseCurrentUser";

/**
 * Obtains relevant coinbase information for a given user's
 * {@param userSecrets}
 * @return {Promise<{coinbaseWallets: *, coinbaseUser: *}>}
 */
const getCoinbaseInfo = async (userSecrets) => {
    const isValidCoinbaseApiKeys = (
        userSecrets &&
        userSecrets.coinbaseApiKeys &&
        userSecrets.coinbaseApiKeys.key &&
        userSecrets.coinbaseApiKeys.secret
    );
    const coinbaseClient = (isValidCoinbaseApiKeys)
        ? new CoinbaseClient({
            apiKey: coinbaseApiKeys.key,
            apiSecret: coinbaseApiKeys.secret
        })
        : null;
    const isValidCoinbaseClient = (!!coinbaseClient && coinbaseClient instanceof CoinbaseClient);
    const [coinbaseWallets, coinbaseUser] = (isValidCoinbaseClient)
        ? await Promise.all([
            getCoinbaseWallets(coinbaseClient).catch(() => null),
            getCoinbaseCurrentUser(coinbaseClient).catch(() => null)
        ])
            .catch(() => [null, null])
        : [null, null];

    return {
        coinbaseWallets,
        coinbaseUser
    };
};

export default getCoinbaseInfo;
