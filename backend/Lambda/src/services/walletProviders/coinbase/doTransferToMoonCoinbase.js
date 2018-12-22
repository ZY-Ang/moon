/*
 * Copyright (c) 2018 moon
 */
import logHead from "../../../utils/logHead";
import logTail from "../../../utils/logTail";
import updatePaymentPayloadRecord from "../../paymentPayloaders/updatePaymentPayloadRecord";
import Decimal from "decimal.js";
import {Client as CoinbaseClient} from "coinbase";
import getUserSecrets from "../../moonUser/getUserSecrets";
import getCoinbaseWallet from "./getCoinbaseWallet";
import doTransferToCoinbaseUser from "./doTransferToCoinbaseUser";
import doTransferToCoinbasePro from "./doTransferToCoinbasePro";
import getCoinbaseProExchangeRate from "../../exchangeRateProviders/coinbasePro/getExchangeRate";
import placeCoinbaseProSellMarketOrder from "../../exchanges/coinbasePro/placeSellMarketOrder";
import {getAuthenticatedClient as getCoinbaseProAuthenticatedClient} from "../../exchanges/coinbasePro/client";
import {base as BASE_CURRENCIES, quote as QUOTE_CURRENCIES} from "../../../constants/exchanges/coinbasePro/currencies";
import {EMAIL as MOON_COINBASE_EMAIL, WALLETS as MOON_COINBASE_WALLET_IDS} from "../../../constants/walletProviders/coinbase/config";

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

    const riskFactor = (baseAmount.lt(10) || baseAmount.gt(2000))
        ? new Decimal(1.0)
        : new Decimal(1.0);
    const requiredAmount = baseAmount.dividedBy(exchangeRate).times(riskFactor).toFixed(8, Decimal.ROUND_UP);

    logTail("getRequiredAmount", requiredAmount);
    return requiredAmount;
};

const doTransferToMoonCoinbase = async (paymentPayloadId, sub, walletID, cartInfo) => {
    logHead("doTransferToMoonCoinbase", {sub, walletID, cartInfo});

    // 1. Get the user's coinbase API keys that were stored
    const {coinbaseApiKeys} = await getUserSecrets(sub);
    if (!coinbaseApiKeys || !coinbaseApiKeys.key || !coinbaseApiKeys.secret) {
        throw new Error("Coinbase credentials are missing.");
    }

    // 2. Instantiate coinbase client for the user
    const userCoinbaseClient = new CoinbaseClient({
        apiKey: coinbaseApiKeys.key,
        apiSecret: coinbaseApiKeys.secret
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
    const coinbaseResponse = await doTransferToCoinbaseUser(
        userCoinbaseWallet,
        MOON_COINBASE_EMAIL,
        requiredAmountInQuote.toString()
    );

    // 6. Store Coinbase transaction data in database
    await updatePaymentPayloadRecord(paymentPayloadId, {
        coinbaseResponse,
        exchangeRate,
        quoteAmount: requiredAmountInQuote,
        quoteCurrency: walletCurrency
    });

    try {
        // TODO: Spin up trading instance and notify of new transaction

        //  ------------------- Currency Reserve Balancing -------------------
        // NOTE: The function may end here. Begin running in parallel with payment payload execution
        const authCoinbaseProClient = getCoinbaseProAuthenticatedClient();
        // 7. Transfer the transferred amount into Coinbase Pro to be traded
        const transferToMoonCoinbaseProResponse = await doTransferToCoinbasePro(
            authCoinbaseProClient,
            requiredAmountInQuote.toString(),
            walletCurrency,
            MOON_COINBASE_WALLET_IDS[walletCurrency]
        );
        // 8. Store CoinbasePro transaction in database
        await updatePaymentPayloadRecord(paymentPayloadId, {transferToMoonCoinbaseProResponse});
        // 9. Place market sell order
        const coinbaseProMarketOrder = await placeCoinbaseProSellMarketOrder(
            authCoinbaseProClient,
            cartInfo.amount,
            walletCurrency,
            cartInfo.currency
        );
        // 10. Store Coinbase Pro Market Order submission data to database
        await updatePaymentPayloadRecord(paymentPayloadId, {coinbaseProMarketOrder});
        // 11. TODO: Poll or webhook for market order when filled and update database
    } catch(error) {
        logTail("transferToMoonCoinbaseError", error);
        // TODO: log error to Slack
    }

    const transferToMoonCoinbaseResult = true;
    logTail("transferToMoonCoinbaseResult", transferToMoonCoinbaseResult);
    return transferToMoonCoinbaseResult;
};

export default doTransferToMoonCoinbase;
