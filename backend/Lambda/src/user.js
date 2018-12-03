/*
 * Copyright (c) 2018 moon
 */
import logHead from "./utils/logHead";
import logTail from "./utils/logTail";
import supportedCurrencies from "./constants/walletProviders/coinbase/currencies";
import getUserInformation from "./services/moonUser/getUserInformation";
import getUserSecrets from "./services/moonUser/getUserSecrets";
import getCoinbaseInfo from "./services/walletProviders/coinbase/getCoinbaseInfo";
import moment from "moment";

const user = async (event) => {
    logHead("user", event);
    const {identity} = event;

    // 1. Obtain all user information from Dynamo in parallel before any secondary jobs.
    const [
        userInformation,
        userSecrets
    ] = await Promise.all([
        getUserInformation(identity.sub).catch(() => null),
        getUserSecrets(identity.sub).catch(() => null)
    ])
        .catch(() => [null, null]);

    // 2. Secondary jobs dependent on user secrets and user information, e.g. API keys, etc.
    const [
        coinbaseInfo
    ] = await Promise.all([
        getCoinbaseInfo(userSecrets).catch(() => null)
    ])
        .catch(() => [null]);

    const user = {
        identity,
        signUpState: {
            referredBy: userInformation && userInformation.referredBy,
            onboardingSkipExpiry: userInformation && userInformation.onboardingSkipExpiry && moment(userInformation.onboardingSkipExpiry, "x").toISOString()
        },
        coinbaseInfo: {
            apiKeysExist: !!userSecrets && !!userSecrets.coinbaseApiKeys,
            user: coinbaseInfo && coinbaseInfo.coinbaseUser,
            wallets: coinbaseInfo && coinbaseInfo.coinbaseWallets && coinbaseInfo.coinbaseWallets
                .filter(wallet => (supportedCurrencies[wallet.balance.currency]))
                .map(wallet => ({
                    id: wallet.id,
                    name: wallet.name,
                    currency: wallet.balance && wallet.balance.currency,
                    balance: wallet.balance && wallet.balance.amount
                }))
        }
    };

    logTail("user", user);
    return user;
};

export default user;
