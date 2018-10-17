/*
 * Copyright (c) 2018 moon
 */
const logHead = require("./utils/logHead");
const logTail = require("./utils/logTail");
const supportedSites = require("../../supportedSites");

const siteInformation = async (event) => {
    logHead("siteInformation", event);

    if (!event.host) {
        throw new Error("Please supply a valid host");
    }

    const site = supportedSites[event.host];

    logTail("siteInformation", site);
    return site;
};

module.exports.handler = siteInformation;
