/*
 * Copyright (c) 2018 moon
 */
import logHead from "./utils/logHead";
import logTail from "./utils/logTail";
import {base as baseCurrencies, quote as quoteCurrencies} from "./constants/exchanges/coinbasePro/currencies";
import getCoinbaseProExchangeRate from "./services/exchangeRateProviders/coinbasePro/getExchangeRate";

/**
 * Deprecated Lambda Function in favour of {@code exchangeRates} to fetch multiple rates at once.
 *
 * NOTE: This function is still used recursively by {@code exchangeRates}
 */
const exchangeRate = async (event) => {
    logHead("exchangeRate", event);

    if (!event.quote) {
        throw new Error("Please supply a valid quote currency.");

    } else if (!event.base) {
        throw new Error("Please supply a valid base currency.");

    } else if (!quoteCurrencies[event.quote]) {
        throw new Error(`${event.quote} is invalid or a currently unsupported quote currency.`);

    } else if (!baseCurrencies[event.base]) {
        throw new Error(`${event.base} is invalid or a currently unsupported base currency.`);
    }

    const exchangeRate = await getCoinbaseProExchangeRate(event.quote, event.base);

    logTail("exchangeRate", exchangeRate);
    return exchangeRate;
};

export default exchangeRate;
