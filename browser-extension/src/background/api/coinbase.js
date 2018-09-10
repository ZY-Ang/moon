/*
 * Copyright (c) 2018 moon
 */

import gql from "graphql-tag";

export const updateCoinbaseApiKey = gql`
    mutation updateCoinbaseApiKey($key: String!, $secret: String!) {
        updateCoinbaseApiKey(input: {
            key: $key,
            secret: $secret
        }) {
            key
            secret
        }
    }
`;