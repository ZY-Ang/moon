import store from "../redux/store";
import gql from "graphql-tag";
import MoonGraphQL from "./MoonGraphQL";
import {getDelayedMinutes} from "../../utils/datetime";
import {ACTION_SET_EXCHANGE_RATES_CACHE} from "../redux/reducers/api";

const MINUTES_TTL_DURATION = 12;

/**
 * Updates a loaded
 *
 * @param exchangeRate {{
 *     [String]: {
 *         quote,
 *         base,
 *         bid,
 *         ask,
 *         ttl,
 *         lastUpdated
 *     }
 * }}
 *
 * to the redux in-memory cache
 */
const updateExchangeRate = (exchangeRate) => store.dispatch({exchangeRate, type: ACTION_SET_EXCHANGE_RATES_CACHE});

const exchangeRateFragment = gql`
    fragment exchangeRateFragment on ExchangeRate {
        quote
        base
        bid
        ask
    }
`;

const queryExchangeRate = gql`
    query exchangeRate(
        $quote: CoinbaseProQuoteCurrency!,
        $base: CoinbaseProBaseCurrency!
    ) {
        exchangeRates(pairs: [{
            quote: $quote,
            base: $base
        }]) {
            ...exchangeRateFragment
        }
    }
    ${exchangeRateFragment}
`;
export const getExchangeRate = async (quote, base) => {
    const CODE = `${quote}_${base}`;
    const exchangeRatesCache = store.getState().apiState.exchangeRates;
    if (!!exchangeRatesCache[CODE] && new Date() < new Date(exchangeRatesCache[CODE].ttl)) {
        return exchangeRatesCache[CODE];

    } else {
        let response = await MoonGraphQL.publicClient
            .query({
                query: queryExchangeRate,
                variables: {quote, base}
            });
        const exchangeRate = response.data &&
            response.data.exchangeRates &&
            response.data.exchangeRates[0];
        const exchangeRateToCache = {
            [CODE]: {
                ...exchangeRate,
                ttl: getDelayedMinutes(MINUTES_TTL_DURATION).toISOString(),
                lastUpdated: (new Date()).toISOString()
            }
        };
        updateExchangeRate(exchangeRateToCache);

        return exchangeRateToCache[CODE];
    }
};

const queryExchangeRates = gql`
    query exchangeRates($pairs: [ExchangeRateInput]!) {
        exchangeRates(pairs: $pairs) {
            ...exchangeRateFragment
        }
    }
    ${exchangeRateFragment}
`;
/**
 * @param pairs {Array<{quote: string, base: string}>}
 */
export const getExchangeRates = async (pairs) => {
    let exchangeRatesCache = store.getState().apiState.exchangeRates;
    const invalidPairs = pairs.filter(({quote, base}) => (
        !exchangeRatesCache[`${quote}_${base}`] ||
        new Date() >= new Date(exchangeRatesCache[`${quote}_${base}`].ttl)
    ));

    let exchangeRatesToCache = {};
    if (!!invalidPairs.length) {
        let response = await MoonGraphQL.publicClient
            .query({
                query: queryExchangeRates,
                variables: {pairs: invalidPairs}
            });
        const ttl = getDelayedMinutes(MINUTES_TTL_DURATION).toISOString();
        const lastUpdated = (new Date()).toISOString();
        response.data.exchangeRates.forEach(exchangeRate => {
            const {quote, base} = exchangeRate;
            exchangeRatesToCache[`${quote}_${base}`] = {
                ...exchangeRate,
                ttl,
                lastUpdated
            };
        });
        updateExchangeRate(exchangeRatesToCache);
        exchangeRatesCache = {
            ...exchangeRatesToCache,
            ...exchangeRatesCache
        };
    }

    let exchangeRates = {};
    pairs.forEach(({quote, base}) => (exchangeRates[`${quote}_${base}`] = exchangeRatesCache[`${quote}_${base}`]));

    return exchangeRates;
};
