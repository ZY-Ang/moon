/*
 * Copyright (c) 2018 moon
 */
import gql from "graphql-tag";
import MoonGraphQL from "./MoonGraphQL";
import {getDelayedHours} from "../../utils/datetime";

const UserFragment = gql`
    fragment userFragment on User {
        identity {
            claims {
                name
                nickname
                email
                email_verified
                picture
            }
        }
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
`;

let userCache = null;
const queryUser = gql`
    query user {
        user {
            ...userFragment
        }
    }
    ${UserFragment}
`;
export const getUser = async () => {
    if (!!userCache && new Date() < new Date(userCache.ttl)) {
        return userCache.cache;

    } else {
        const response = await (await MoonGraphQL.authClient)
            .query({
                query: queryUser,
                fetchPolicy: 'network-only'
            });

        userCache = {
            cache: response,
            ttl: getDelayedHours(2).toISOString()
        };

        return response;
    }
};

const mutationOnboardingSkipExpiry = gql`
    mutation updateOnboardingSkipExpiry($onboardingSkipExpiry: AWSDateTime!) {
        updateUser(input: {
            userInformation: {
                onboardingSkipExpiry: $onboardingSkipExpiry
            }
        }) {
            ...userFragment
        }
    }
    ${UserFragment}
`;
export const updateOnboardingSkipExpiry = async (hoursOffset) => {
    const response = await (await MoonGraphQL.authClient)
        .mutate({
            mutation: mutationOnboardingSkipExpiry,
            variables: {
                onboardingSkipExpiry: getDelayedHours(!!hoursOffset ? hoursOffset : 168).toISOString()
            }
        });

    userCache = {
        cache: {
            data: {
                user: response.data.updateUser
            }
        },
        ttl: getDelayedHours(2).toISOString()
    };

    return response;
};

export const onUpdateUser = gql`
    subscription onUpdateUser {
        onUpdateUser {
            ...userFragment
        }
    }
    ${UserFragment}
`;

const mutationGetPaymentPayload = gql`
    mutation getPaymentPayload(
        $payloadCurrency: Currency!,
        $payloadAmount: String!,
        $walletProvider: WalletProvider!,
        $walletID: ID!,
        $pageContent: String!,
        $pageURL: AWSURL!
    ) {
        getPaymentPayload(input: {
            cartInfo: {
                currency: $payloadCurrency,
                amount: $payloadAmount
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
                ...userFragment
            }
        }
    }
    ${UserFragment}
`;
export const doGetPaymentPayload = async (variables) => {
    const response = await (await MoonGraphQL.authClient)
        .mutate({
            mutation: mutationGetPaymentPayload,
            variables
        });

    userCache = {
        cache: {
            data: {
                user: response.data.getPaymentPayload.user
            }
        },
        ttl: getDelayedHours(2).toISOString()
    };

    return response;
};

const mutationUpdateCoinbaseApiKey = gql`
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
            ...userFragment
        }
    }
    ${UserFragment}
`;
export const doUpdateCoinbaseApiKey = async (key, secret, innerHTML) => {
    const response = await (await MoonGraphQL.authClient)
        .mutate({
            mutation: mutationUpdateCoinbaseApiKey,
            variables: {
                key,
                secret,
                innerHTML,
                onboardingSkipExpiry: getDelayedHours(168).toISOString()
            }
        });

    userCache = {
        cache: {
            data: {
                user: response.data.updateUser
            }
        },
        ttl: getDelayedHours(2).toISOString()
    };

    return response;
};
