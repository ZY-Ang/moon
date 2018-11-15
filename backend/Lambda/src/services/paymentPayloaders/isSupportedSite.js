/*
 * Copyright (c) 2018 moon
 */
import logHead from "../../utils/logHead";
import logTail from "../../utils/logTail";
import {URL} from "url";
import supportedSites from "../../../supportedSites";

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

export default isSupportedSite;
