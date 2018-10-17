/*
 * Copyright (c) 2018 moon
 */
const logHead = require("../../utils/logHead");
const logTail = require("../../utils/logTail");
const {URL} = require('url');
const supportedSites = require("../../../../supportedSites");

/**\
 * @return {boolean} {@code true} if {@param url} is supported,
 * {@code false} otherwise.
 */
const isSupportedSite = (url) => {
    logHead("isSupportedSite", url);
    let isSupported = null;

    try {
        const {host} = new URL(url);
        isSupported = !!supportedSites[host] && supportedSites[host].isSupported;

    } catch (error) {
        console.error(error);
        isSupported = false;
    }

    logTail("isSupported", isSupported);
    return isSupported;
};

module.exports = isSupportedSite;
