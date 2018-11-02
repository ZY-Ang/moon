/*
 * Copyright (c) 2018 moon
 */
const logHead = require("./utils/logHead");
const logTail = require("./utils/logTail");
const getUser = require("./user").handler;
const updateCoinbaseApiKeys = require("./services/walletProviders/coinbase/updateCoinbaseApiKeys");

const updateUser = async (event) => {
    logHead("updateUser", event);

    const {arguments: args, identity} = event;
    await Promise.all([
        updateCoinbaseApiKeys(identity.sub, args.input.coinbaseApiKeys)
    ]);

    const updatedUser = await getUser(event);
    logTail("updatedUser", updatedUser);
    return updatedUser;
};

module.exports.handler = updateUser;
