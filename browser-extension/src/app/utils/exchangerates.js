import Decimal from "decimal.js";

export const getRequiredAmountInQuote = (baseAmount, exchangeRate) => {
    try {
        baseAmount = new Decimal(baseAmount);
        exchangeRate = new Decimal(exchangeRate);
    } catch (e) {
        return Decimal(NaN).toFixed(8, Decimal.ROUND_UP);
    }
    const riskFactor = (baseAmount.lt(10) || baseAmount.gt(2000))
        ? new Decimal(1.0)
        : new Decimal(1.0);
    return baseAmount.dividedBy(exchangeRate).times(riskFactor).toFixed(8, Decimal.ROUND_UP);
};
export const getWalletBalanceInBase = (quoteAmount, exchangeRate) => {
    try {
        quoteAmount = new Decimal(quoteAmount);
        exchangeRate = new Decimal(exchangeRate);
    } catch (e) {
        return Decimal(NaN).toFixed(2, Decimal.ROUND_UP);
    }
    return quoteAmount.times(exchangeRate).toFixed(2, Decimal.ROUND_DOWN);
};