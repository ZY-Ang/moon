/*
 * Copyright (c) 2018 moon
 */
import Tabs from "../browser/Tabs";
import {REQUEST_UPDATE_PAGE_INFORMATION} from "../../constants/events/backgroundEvents";
import {getSiteInformation} from "../api/siteInformation";

export const doUpdatePageInfoEvent = async (url) => {
    try {
        const {host} = new URL(url);
        const {siteInformation} = (await getSiteInformation(host)).data;
        if (!siteInformation) {
            console.warn(`Site information using ${url} was invalid`);
            return Tabs.sendMessageToActive(REQUEST_UPDATE_PAGE_INFORMATION, {siteInformation: null});
        }
        return Tabs.sendMessageToActive(REQUEST_UPDATE_PAGE_INFORMATION, {siteInformation});
    } catch (error) {
        console.error("doUpdatePageInfoEvent: ", error);
        return Tabs.sendMessageToActive(REQUEST_UPDATE_PAGE_INFORMATION, {siteInformation: null});
    }
};
