/*
 * Copyright (c) 2018 moon
 */

import MoonGraphQL from "../api/MoonGraphQL";
import {addSiteSupportRequest, getPaymentPayload, siteInformation, user} from "../api/moon";

export const getUser = () =>
    MoonGraphQL.authClient
        .query({
            query: user
        });

export const getSiteInformation = (host) =>
    MoonGraphQL.authClient
        .query({
            query: siteInformation,
            variables: {host}
        });

export const doGetPaymentPayload = (variables) =>
    MoonGraphQL.authClient
        .mutate({
            mutation: getPaymentPayload,
            variables
        });

export const doAddSiteSupportRequest = (host) =>
    MoonGraphQL.authClient
        .mutate({
            mutation: addSiteSupportRequest,
            variables: {host}
        });
