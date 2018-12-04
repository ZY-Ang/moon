import MoonGraphQL from "./MoonGraphQL";
import gql from "graphql-tag";

const querySiteInformation = gql`
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
        query: querySiteInformation,
        variables: {host}
    });

const mutationAddSiteSupportRequest = gql`
    mutation addSiteSupportRequest($email: AWSEmail="guest@paywithmoon.com", $host: String!) {
        addSiteSupportRequest(email: $email, host: $host)
    }
`;
export const doAddSiteSupportRequest = async (email, host) => (MoonGraphQL.publicClient)
    .mutate({
        mutation: mutationAddSiteSupportRequest,
        variables: {email, host}
    });

const mutationAddNonCheckoutReport = gql`
    mutation addNonCheckoutReport($url: AWSURL!, $content: String!) {
        addNonCheckoutReport(input: {
            url: $url,
            content: $content
        })
    }
`;
export const doAddNonCheckoutReport = async (url, content) => (MoonGraphQL.publicClient)
    .mutate({
        mutation: mutationAddNonCheckoutReport,
        variables: {
            url,
            content
        }
    });
