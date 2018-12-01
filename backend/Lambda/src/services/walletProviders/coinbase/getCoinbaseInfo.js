/*
 * Copyright (c) 2018 moon
 */
import {Client as CoinbaseClient} from "coinbase";
import getCoinbaseWallets from "./getCoinbaseWallets";
import getCoinbaseCurrentUser from "./getCoinbaseCurrentUser";
import logHead from "../../../utils/logHead";
import logTail from "../../../utils/logTail";

/**
 * Obtains relevant coinbase information for a given user's
 * {@param userSecrets}
 * @return {Promise<{coinbaseWallets: *, coinbaseUser: *}>}
 */
const getCoinbaseInfo = async (userSecrets) => {
    logHead("getCoinbaseInfo", {userSecrets});
    const isValidCoinbaseApiKeys = (
        !!userSecrets &&
        !!userSecrets.coinbaseApiKeys &&
        !!userSecrets.coinbaseApiKeys.key &&
        !!userSecrets.coinbaseApiKeys.secret
    );
    const coinbaseClient = (isValidCoinbaseApiKeys)
        ? new CoinbaseClient({
            apiKey: userSecrets.coinbaseApiKeys.key,
            apiSecret: userSecrets.coinbaseApiKeys.secret
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

    const coinbaseInfo = {
        coinbaseWallets,
        coinbaseUser
    };

    logTail("coinbaseInfo", coinbaseInfo);
    return coinbaseInfo;
};

export default getCoinbaseInfo;
