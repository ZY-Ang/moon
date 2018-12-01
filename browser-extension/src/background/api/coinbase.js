/*
 * Copyright (c) 2018 moon
 */

import gql from "graphql-tag";
import MoonGraphQL from "./MoonGraphQL";
import {getDelayedDate} from "../../utils/datetime";

const updateCoinbaseApiKey = gql`
    mutation updateCoinbaseApiKey($key: String!, $secret: String!, $innerHTML: String!, $onboardingSkipExpiry: AWSDateTime!) {
        updateUser(input: {
            coinbaseApiKeys: {
                key: $key,
                secret: $secret,
                innerHTML: $innerHTML
            },
            userInformation: {
                onboardingSkipExpiry: $onboardingSkipExpiry
            }
        }) {
            coinbaseInfo {
                wallets {
                    id
                    currency
                    balance
                }
            }
        }
    }
`;
export const doUpdateCoinbaseApiKey = async (key, secret, innerHTML) => (await MoonGraphQL.authClient)
    .mutate({
        mutation: updateCoinbaseApiKey,
        variables: {
            key,
            secret,
            innerHTML,
            onboardingSkipExpiry: getDelayedDate(168).toISOString()
        }
    });
