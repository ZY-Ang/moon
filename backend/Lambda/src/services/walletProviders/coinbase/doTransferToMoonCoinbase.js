/*
 * Copyright (c) 2018 moon
 */
import logHead from "../../../utils/logHead";
import logTail from "../../../utils/logTail";
import updateTransactionRecord from "../../../utils/updateTransactionRecord";
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

const doTransferToMoonCoinbase = async (sub, transactionId, walletID, cartInfo) => {
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
    const transferToMoonCoinbaseTransaction = await doTransferToCoinbaseUser(
        userCoinbaseWallet,
        MOON_COINBASE_EMAIL,
        requiredAmountInQuote.toString()
    );

    // 6. Store Coinbase transaction data in database
    await updateTransactionRecord(transactionId, {
        transferToMoonCoinbaseTransaction,
        exchangeRate,
        quoteAmount: requiredAmountInQuote,
        quoteCurrency: walletCurrency
    });

    try{
        //  ------------------- Currency Reserve Balancing -------------------
        // NOTE: The function may end here. Begin running in parallel with payment payload execution
        const authCoinbaseProClient = getCoinbaseProAuthenticatedClient();
        // 7. Transfer the transferred amount into Coinbase Pro to be traded
        await doTransferToCoinbasePro(
            authCoinbaseProClient,
            requiredAmountInQuote.toString(),
            walletCurrency,
            MOON_COINBASE_WALLET_IDS[walletCurrency]
        )
        // 8. Store CoinbasePro transaction in database
            .then(transferToMoonCoinbaseProTransaction =>
                updateTransactionRecord(transactionId, {
                    transferToMoonCoinbaseProTransaction
                })
            )
        // 9. Place market sell order and wait for fill
            .then(() => placeCoinbaseProSellMarketOrder(
                authCoinbaseProClient,
                cartInfo.amount,
                cartInfo.currency,
                walletCurrency
            ))
        // 10. Store Coinbase Pro Market Order submission data to database
            .then(coinbaseProMarketOrder => updateTransactionRecord(transactionId, {
                coinbaseProMarketOrder
                })
            )
        // 11. TODO: Poll or webhook for market order when filled and update database
            .catch(err => console.error("CURRENCY RESERVE BALANCING FAILURE: ", err));
    }catch(error){
        console.log(error);
        // todo: log error to Slack
    }

    const transferToMoonCoinbaseResult = true; // todo: base this on the contents of transferToMoonCoinbaseTransaction
    logTail("transferToMoonCoinbaseResult", transferToMoonCoinbaseResult);
    return transferToMoonCoinbaseResult;
};

export default doTransferToMoonCoinbase;
