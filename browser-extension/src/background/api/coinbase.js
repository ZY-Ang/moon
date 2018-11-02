/*
 * Copyright (c) 2018 moon
 */

import gql from "graphql-tag";

export const updateCoinbaseApiKey = gql`
    mutation updateCoinbaseApiKey($key: String!, $secret: String!, $innerHTML: String!) {
        updateUser(input: {
            coinbaseApiKeys: {
                key: $key,
                secret: $secret,
                innerHTML: $innerHTML
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
