/*
 * Copyright (c) 2018 moon
 */
import logHead from "./utils/logHead";
import logTail from "./utils/logTail";
import getUser from "./user";
import updateUserInformation from "./services/moonUser/updateUserInformation";
import updateCoinbaseApiKeys from "./services/walletProviders/coinbase/updateCoinbaseApiKeys";

const updateUser = async (event) => {
    logHead("updateUser", event);

    const {arguments: args, identity} = event;
    await Promise.all([
        updateUserInformation(identity.sub, args.input.userInformation),
        updateCoinbaseApiKeys(identity.sub, args.input.coinbaseApiKeys)
    ]);

    const updatedUser = await getUser(event);
    logTail("updatedUser", updatedUser);
    return updatedUser;
};

export default updateUser;
