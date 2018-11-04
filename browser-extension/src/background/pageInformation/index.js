/*
 * Copyright (c) 2018 moon
 */
import Tabs from "../browser/Tabs";
import {REQUEST_UPDATE_PAGE_INFORMATION} from "../../constants/events/backgroundEvents";
import {getSiteInformation} from "../api/moon";

export const doUpdatePageInfoEvent = async (url) => {
    console.log("doUpdatePageInfoEvent");
    try {
        if (url) {
            const {host} = new URL(url);
            const {siteInformation} = (await getSiteInformation(host)).data;
            return Tabs.sendMessageToActive(REQUEST_UPDATE_PAGE_INFORMATION, {siteInformation});
        } else {
            return Tabs.sendMessageToActive(REQUEST_UPDATE_PAGE_INFORMATION);
        }
    } catch (e) {
        return Tabs.sendMessageToActive(REQUEST_UPDATE_PAGE_INFORMATION);
    }
};
