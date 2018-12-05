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

    const exchangeRates = await Promise.all(pairs.map(pair => getExchangeRate(pair).catch(() => pair)));

    logTail("exchangeRates", exchangeRates);
    return exchangeRates;
};

export default exchangeRates;
