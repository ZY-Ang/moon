/*
 * Copyright (c) 2018 moon
 */

const walletProviders = require("../../constants/walletProviders");

/**
 * Validates a {@param wallet}.
 * @throws {error} if is invalid.
 */
module.exports = (wallet) => {
    if (!wallet) {
        throw new Error("WInvalid wallet: Wallet is not provided");
    } else if (!wallet.provider) {
        throw new Error("Invalid wallet: Wallet provider is not provided");
    } else if (!wallet.id) {
        throw new Error("Invalid wallet: Wallet id is not provided");
    } else if (!walletProviders[wallet.provider]) {
        throw new Error(`Invalid wallet: wallet.provider (${wallet.provider}) is invalid or a currently unsupported wallet provider.`);
    }
};
