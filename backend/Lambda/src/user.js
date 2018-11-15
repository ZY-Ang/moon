/*
 * Copyright (c) 2018 moon
 */
import logHead from "./utils/logHead";
import logTail from "./utils/logTail";
import supportedCurrencies from "./constants/walletProviders/coinbase/currencies";
import {Client as CoinbaseClient} from "coinbase";
import getCoinbaseApiKeys from "./services/walletProviders/coinbase/getCoinbaseApiKeys";
import getCoinbaseCurrentUser from "./services/walletProviders/coinbase/getCoinbaseCurrentUser";
import getCoinbaseWallets from "./services/walletProviders/coinbase/getCoinbaseWallets";

const user = async (event) => {
    logHead("user", event);
    const {identity} = event;

    // coinbaseInfo
    const coinbaseApiKeys = await getCoinbaseApiKeys(identity.sub);
    const isValidCoinbaseApiKeys = (coinbaseApiKeys && coinbaseApiKeys.key && coinbaseApiKeys.secret);
    const coinbaseClient = (isValidCoinbaseApiKeys)
        ? new CoinbaseClient({
            apiKey: coinbaseApiKeys.key,
            apiSecret: coinbaseApiKeys.secret
        })
        : null;
    const [coinbaseWallets, coinbaseUser] = (isValidCoinbaseApiKeys)
        ? await Promise.all([
            getCoinbaseWallets(coinbaseClient),
            getCoinbaseCurrentUser(coinbaseClient)
        ])
            .catch(() => [null, null])
        : [null, null];

    const user = {
        signUpState: {
            referredBy: null
        },
        coinbaseInfo: coinbaseApiKeys ? {
            user: coinbaseUser,
            wallets: coinbaseWallets && coinbaseWallets
                .filter(wallet => (supportedCurrencies[wallet.balance.currency]))
                .map(wallet => ({
                    id: wallet.id,
                    name: wallet.name,
                    currency: wallet.balance && wallet.balance.currency,
                    balance: wallet.balance && wallet.balance.amount
                }))
        } : null
    };

    logTail("user", user);
    return user;
};

export default user;
