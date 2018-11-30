/*
 * Copyright (c) 2018 moon
 */
import logHead from "../../../utils/logHead";
import logTail from "../../../utils/logTail";

/**
 * Gets the coinbase current user using
 * @see {@link https://developers.coinbase.com/api/v2#show-current-user}
 *
 * @param coinbaseClient - Coinbase Client instance
 * @return {Promise<object>}
 */
const getCoinbaseCurrentUser = async (coinbaseClient) => {
    logHead("getCoinbaseUser", coinbaseClient);

    const coinbaseUser = await new Promise((resolve, reject) =>
        coinbaseClient.getCurrentUser((err, currentUser) => {
            if (err) {
                console.error(err);
                reject(err);
            } else if (!currentUser) {
                reject(new Error(`Coinbase returned malformed currentUser: ${currentUser}`));
            } else {
                // Make sure users' secrets don't get logged.
                delete currentUser.client;
                resolve(currentUser);
            }
        })
    );

    logTail("coinbaseUser", coinbaseUser);
    return coinbaseUser;
};

export default getCoinbaseCurrentUser;
