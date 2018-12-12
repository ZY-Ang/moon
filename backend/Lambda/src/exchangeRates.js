import getExchangeRate from  "./exchangeRate";
import logHead from "./utils/logHead";
import logTail from "./utils/logTail";

const exchangeRates = async (event) => {
    logHead("exchangeRates", event);
    const {pairs} = event;

    if (!pairs) {
        throw new Error("Please supply pairs of supported quote and base codes");
    } else if (pairs.constructor !== Array) {
        throw new Error("Pairs supplied is not a list");
    }

    let duplicatePairs = {};
    const exchangeRates = (await Promise.all(pairs
        .filter(({quote, base}) => {
            // Filter out duplicate pairs
            if (
                !!quote &&
                !!base &&
                !duplicatePairs[`${quote}_${base}`]
            ) {
                duplicatePairs[`${quote}_${base}`] = true;
                return true;
            } else {
                return false;
            }
        })
        .map(pair => getExchangeRate(pair).catch(() => pair))
    ))
        .filter(pair => !!pair);

    logTail("exchangeRates", exchangeRates);
    return exchangeRates;
};

export default exchangeRates;
