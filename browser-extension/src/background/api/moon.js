/*
 * Copyright (c) 2018 moon
 */

import gql from "graphql-tag";
import MoonGraphQL from "./MoonGraphQL";
import {getDelayedDate} from "../../utils/datetime";

const user = gql`
    query user {
        user {
            signUpState {
                onboardingSkipExpiry
            }
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
export const getUser = async () => (await MoonGraphQL.authClient)
    .query({
        query: user,
        fetchPolicy: 'network-only'
    });

const onboardingSkipExpiry = gql`
    mutation updateOnboardingSkipExpiry($onboardingSkipExpiry: AWSDateTime!) {
        updateUser(input: {
            userInformation: {
                onboardingSkipExpiry: $onboardingSkipExpiry
            }
        }) {
            signUpState {
                onboardingSkipExpiry
            }
        }
    }
`;
export const updateOnboardingSkipExpiry = async (hoursOffset) => (await MoonGraphQL.authClient)
    .mutate({
        mutation: onboardingSkipExpiry,
        variables: {
            onboardingSkipExpiry: getDelayedDate(!!hoursOffset ? hoursOffset : 168).toISOString()
        }
    });

export const onUpdateUser = gql`
    subscription onUpdateUser {
        onUpdateUser {
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

const exchangeRates = gql`
    query exchangeRates(
        $quote: CoinbaseProQuoteCurrency!,
        $base: CoinbaseProBaseCurrency!
    ) {
        exchangeRate(quote: $quote, base: $base) {
            bid
            ask
        }
    }
`;
export const getExchangeRate = async (quote, base) => (MoonGraphQL.publicClient)
    .query({
        query: exchangeRates,
        variables: {quote, base}
    });

const siteInformation = gql`
    query siteInformation($host: String!) {
        siteInformation(host: $host) {
            name
            logoURL
            isSupported
            pathnameCheckout
            querySelectorParseObserver
            querySelectorMoonButton
            querySelectorCartAmount
            querySelectorCartCurrency
            querySelectorProductTitle
            querySelectorProductImage
            querySelectorAddToCart
            querySelectorProductPrice
        }
    }
`;
export const getSiteInformation = async (host) => (MoonGraphQL.publicClient)
    .query({
        query: siteInformation,
        variables: {host}
    });

const getPaymentPayload = gql`
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
            user {
                coinbaseInfo {
                    wallets {
                        id
                        currency
                        balance
                    }
                }
            }
        }
    }
`;
export const doGetPaymentPayload = async (variables) => (await MoonGraphQL.authClient)
    .mutate({
        mutation: getPaymentPayload,
        variables
    });

const addSiteSupportRequest = gql`
    mutation addSiteSupportRequest($email: AWSEmail="guest@paywithmoon.com", $host: String!) {
        addSiteSupportRequest(email: $email, host: $host)
    }
`;
export const doAddSiteSupportRequest = async (email, host) => (MoonGraphQL.publicClient)
    .mutate({
        mutation: addSiteSupportRequest,
        variables: {email, host}
    });

const addNonCheckoutReport = gql`
    mutation addNonCheckoutReport($url: AWSURL!, $content: String!) {
        addNonCheckoutReport(input: {
            url: $url,
            content: $content
        })
    }
`;
export const doAddNonCheckoutReport = async (url, content) => (MoonGraphQL.publicClient)
    .mutate({
        mutation:addNonCheckoutReport,
        variables: {
            url,
            content
        }
    });
