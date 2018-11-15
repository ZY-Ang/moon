/*
 * Copyright (c) 2018 moon
 */
import logHead from "./utils/logHead";
import logTail from "./utils/logTail";
import supportedSites from "../supportedSites";

const siteInformation = async (event) => {
    logHead("siteInformation", event);

    if (!event.host) {
        throw new Error("Please supply a valid host");
    }

    const site = supportedSites[event.host];

    logTail("siteInformation", site);
    return site;
};

export default siteInformation;
