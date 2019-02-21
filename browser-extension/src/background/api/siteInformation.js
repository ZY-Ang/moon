import MoonGraphQL from "./MoonGraphQL";
import gql from "graphql-tag";

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
    mutation addNonCheckoutReport($email: AWSEmail="guest@paywithmoon.com", $url: AWSURL!, $content: String!) {
        addNonCheckoutReport(email: $email, input: {
            url: $url,
            content: $content
        })
    }
`;
export const doAddNonCheckoutReport = async (url, content, email) => (MoonGraphQL.publicClient)
    .mutate({
        mutation: mutationAddNonCheckoutReport,
        variables: {url, content, email}
    });
