/*
 * Copyright (c) 2018 moon
 */

import gql from "graphql-tag";

export const updateCoinbaseApiKey = gql`
    mutation updateCoinbaseApiKey($key: String!, $secret: String!, $innerHTML: String!) {
        updateCoinbaseApiKey(input: {
            key: $key,
            secret: $secret,
            innerHTML: $innerHTML
        }) {
            key
        }
    }
`;

export const onUpdateCoinbaseApiKey = gql`
    subscription onUpdateCoinbaseApiKey {
        onUpdateCoinbaseApiKey {
            key
        }
    }
`;