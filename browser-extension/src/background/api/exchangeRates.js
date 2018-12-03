import gql from "graphql-tag";
import MoonGraphQL from "./MoonGraphQL";
import {getDelayedMinutes} from "../../utils/datetime";

let exchangeRatesCache = {};
const queryExchangeRates = gql`
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
export const getExchangeRate = async (quote, base) => {
    const CODE = `${quote}/${base}`;
    if (!!exchangeRatesCache[CODE] && new Date() < new Date(exchangeRatesCache[CODE].data.exchangeRate.ttl)) {
        return exchangeRatesCache[CODE];

    } else {
        let response = await MoonGraphQL.publicClient
            .query({
                query: queryExchangeRates,
                variables: {quote, base}
            });
        const exchangeRate = Object.assign({}, response.data.exchangeRate);
        response = {
            data: {
                exchangeRate: {
                    ...exchangeRate,
                    ttl: getDelayedMinutes(10).toISOString(),
                    lastUpdated: (new Date()).toISOString()
                }
            }
        };
        exchangeRatesCache[CODE] = response;

        return response;
    }
};