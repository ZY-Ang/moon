/*
 * Copyright (c) 2018 moon
 */
const logHead = require("../../../utils/logHead");
const logTail = require("../../../utils/logTail");
const Decimal = require("decimal.js");
const {Client: CoinbaseClient} = require("coinbase");
const getCoinbaseApiKeys = require("./getCoinbaseApiKeys");
const getCoinbaseWallet = require("./getCoinbaseWallet");
const doTransferToCoinbaseUser = require("./doTransferToCoinbaseUser");
const doTransferToCoinbasePro = require("./doTransferToCoinbasePro");
const getCoinbaseProExchangeRate = require("../../exchangeRateProviders/coinbasePro/getExchangeRate");
const placeCoinbaseProSellMarketOrder = require("../../exchanges/coinbasePro/placeSellMarketOrder");
const {getAuthenticatedClient: getCoinbaseProAuthenticatedClient} = require("../../exchanges/coinbasePro/client");
const {base: BASE_CURRENCIES, quote: QUOTE_CURRENCIES} = require("../../../constants/exchanges/coinbasePro/currencies");
const {EMAIL: MOON_COINBASE_EMAIL, WALLETS: MOON_COINBASE_WALLET_IDS} = require("../../../constants/walletProviders/coinbase/config");

/**
 * Round up the 8th digit of an amount of currency if necessary to Coinbase's standard.
 * @param amount {Decimal}
 * @returns {string}
 */
const roundAmount = (amount) => {
    logHead("roundAmount", amount);

    const fixedDecimal = 8; // round up the 8th digit (Coinbase's standard)
    const ten = new Decimal(10);
    const mask = ten.pow(fixedDecimal);
    const roundedAmount = mask.times(new Decimal(amount)).ceil().dividedBy(mask).toFixed(8);

    logTail("roundedAmount", roundedAmount);
    return roundedAmount;
};

/**
 * Calculates the required amount that is needed for a transaction.
 * @param baseAmount {string} - amount in the base currency to be converted from.
 * @param exchangeRate {string} - exchange rate of the quoted currency.
 * @returns {string}
 */
const getRequiredAmount = (baseAmount, exchangeRate) => {
    logHead("getRequiredAmount", {baseAmount, exchangeRate});
    // deal with decimal stuff, round correctly
    baseAmount = new Decimal(baseAmount);
    exchangeRate = new Decimal(exchangeRate);

    const riskFactor = (baseAmount.lt(10) || baseAmount.gt(2000)) ? new Decimal(1.01) : new Decimal(1.0);

    const requiredAmount = roundAmount(baseAmount.dividedBy(exchangeRate).times(riskFactor));

    logTail("getRequiredAmount", requiredAmount);
    return requiredAmount;
};

const doTransferToMoonCoinbase = async (sub, walletID, cartInfo) => {
    logHead("doTransferToMoonCoinbase", {sub, walletID, cartInfo});

    // 1. Get the user's coinbase API keys that were stored
    const userCoinbaseApiKeys = await getCoinbaseApiKeys(sub);
    if (!userCoinbaseApiKeys || !userCoinbaseApiKeys.key || !userCoinbaseApiKeys.secret) {
        throw new Error("Coinbase credentials are missing.");
    }

    // 2. Instantiate coinbase client for the user
    const userCoinbaseClient = new CoinbaseClient({
        apiKey: userCoinbaseApiKeys.key,
        apiSecret: userCoinbaseApiKeys.secret
    });

    // 3. Instantiate a coinbase wallet instance for the user
    const userCoinbaseWallet = await getCoinbaseWallet(userCoinbaseClient, walletID);
    const walletCurrency = userCoinbaseWallet.balance.currency;
    if (!QUOTE_CURRENCIES[walletCurrency]) {
        throw new Error("Selected wallet is not denominated in a currency we support");
    } else if (!BASE_CURRENCIES[cartInfo.currency]) {
        throw new Error(`Cart currency ${cartInfo.currency} is invalid or a currently unsupported base currency.`);
    }

    // 4. Exchange rate and balance pre-calculation to determine if there is enough balance and margin for the purchase
    const exchangeRate = await getCoinbaseProExchangeRate(walletCurrency, cartInfo.currency);
    const requiredAmountInQuote = getRequiredAmount(cartInfo.amount, exchangeRate.bid);
    if (new Decimal(userCoinbaseWallet.balance.amount).lt(requiredAmountInQuote)) {
        throw new Error("Insufficient funds");
    }

    // 5. Pay Moon's Coinbase wallet from the user's wallet
    const transferToMoonCoinbaseTransaction = await doTransferToCoinbaseUser(
        userCoinbaseWallet,
        MOON_COINBASE_EMAIL,
        requiredAmountInQuote.toString()
    );

    // 6. TODO: Store Coinbase transaction ID in database
    // const {id} = transferToMoonCoinbaseTransaction;


    //  ------------------- Currency Reserve Balancing -------------------
    // NOTE: The function may end here. Begin running in parallel with payment payload execution
    const authCoinbaseProClient = getCoinbaseProAuthenticatedClient();
    // 7. Transfer the transferred amount into Coinbase Pro to be traded
    doTransferToCoinbasePro(
        authCoinbaseProClient,
        requiredAmountInQuote.toString(),
        walletCurrency,
        MOON_COINBASE_WALLET_IDS[walletCurrency]
    )
    // 8. TODO: Store CoinbasePro transaction ID in a database
        .then(transferToMoonCoinbaseProTransaction => {
            // const {id} = transferToMoonCoinbaseProTransaction
        })
    // 9. Place market sell order and wait for fill
        .then(() => placeCoinbaseProSellMarketOrder(
            authCoinbaseProClient,
            cartInfo.amount,
            cartInfo.currency,
            walletCurrency
        ))
    // 10. TODO: Poll or webhook for market order when filled and update database
        .then(coinbaseProMarketOrder => {
            // const {id} = coinbaseProMarketOrder
        })
        .catch(err => console.error("CURRENCY RESERVE BALANCING FAILURE: ", err));

    const transferToMoonCoinbaseResult = true;
    logTail("transferToMoonCoinbaseResult", transferToMoonCoinbaseResult);
    return transferToMoonCoinbaseResult;
};

module.exports = doTransferToMoonCoinbase;
