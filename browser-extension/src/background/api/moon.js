/*
 * Copyright (c) 2018 moon
 */

import gql from "graphql-tag";

export const user = gql`
    query user {
        user {
            coinbaseInfo {
                wallets {
                    id
                    currency
                    balance
                }
            }
        }
        identity {
            claims {
                name
                nickname
                email
                email_verified
                picture
            }
        }
    }
`;

export const siteInformation = gql`
    query siteInformation($host: String!) {
        siteInformation(host: $host) {
            name
            logoURL
            isSupported
            pathnameCheckout
            pathnameProduct
            endpointPaymentPayloadApply
        }
    }
`;

export const getPaymentPayload = gql`
    mutation getPaymentPayload(
        $cartCurrency: Currency!,
        $cartAmount: String!,
        $walletProvider: WalletProvider!,
        $walletID: ID!,
        $pageContent: String!,
        $pageURL: AWSURL!
    ) {
        getPaymentPayload(input: {
            cartInfo: {
                currency: $cartCurrency,
                amount: $cartAmount
            },
            wallet: {
                provider: $walletProvider,
                id: $walletID
            },
            pageInfo: {
                content: $pageContent,
                url: $pageURL
            }
        }) {
            id
            data
            balance
            currency
            user
        }
    }
`;

export const addSiteSupportRequest = gql`
    mutation addSiteSupportRequest($host: String!) {
        addSiteSupportRequest(host: $host)
    }
`;
