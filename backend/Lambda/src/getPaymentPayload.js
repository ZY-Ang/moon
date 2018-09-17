/*
 * Copyright (c) 2018 moon
 */

const Decimal = require('decimal.js');
const CoinbaseClient = require('coinbase').Client;
const gdax = require('gdax');
const logHead = require("./utils/logHead");
const logTail = require("./utils/logTail");
const baseCurrencies = require("./constants/exchanges/coinbasePro/currencies").base;
const quoteCurrencies = require("./constants/exchanges/coinbasePro/currencies").quote;
const {walletProviders} = require("./constants/walletProviders");
const getCoinbaseApiKeys = require("./services/walletProviders/coinbase/getCoinbaseApiKeys");
const getCoinbaseWallet = require("./services/walletProviders/coinbase/getCoinbaseWallet");
const sendFundsToCoinbaseUser = require("./services/walletProviders/coinbase/sendFundsToCoinbaseUser");
const getCoinbaseProExchangeRate = require("./services/walletProviders/coinbase/getCoinbaseProExchangeRate");
const sendFundsFromCoinbaseToCoinbasePro = require("./services/walletProviders/coinbase/sendFundsFromCoinbaseToCoinbasePro");
const placeSellMarketOrderOnCoinbasePro = require("./services/walletProviders/coinbase/placeSellMarketOrderOnCoinbasePro");

const key = 'your_api_key'; // todo: get from env
const secret = 'your_b64_secret'; // todo: get from env
const passphrase = 'your_passphrase'; // todo: get from env

// todo: switch to apiURI from sandboxURI
const apiURI = 'https://api.coinbasePro.com';
const sandboxURI = 'https://api-public.sandbox.coinbasePro.com';

const moonCoinbaseAccountEmail = "ken@kenco.io";

// Saving the Coinbase wallet ids here prevents us from making an additional call to the API
// These ids do not change unless we switch to another account
// todo: update these with the actual account ids, add ETC
const moonCoinbaseWalletIds = {
    ETH: '84d0b4d1-af06-5a2c-9010-a67b189ff43e',
    BTC: 'feeb0346-bfcd-57f4-9eab-7daedac7908e',
    BCH: '8d98dd01-b443-50dc-a101-12c8ead253be',
    LTC: '0f083601-0241-5433-929c-7db96902568e',
    ETC: ''
};

// Round up the 8th digit of an amount of currency if necessary. This is Coinbase's standard. Returns a string
const roundCurrency = (amount) => {
    amount = new Decimal(amount);
    const fixedDecimal = 8; // round up the 8th digit (Coinbase's standard)
    const ten = new Decimal(10);
    const mask = ten.pow(fixedDecimal);
    const roundedAmount = mask.times(amount).ceil().dividedBy(mask);
    console.log(amount.toFixed(10), mask.toFixed(10), roundedAmount.toFixed(10));
    return roundedAmount.toFixed(8);
};

// Calculate the amount of crypto that is needed to transfer from the user's account to complete the sale
// For now this is simple, but more sophisticated techniques can be used in the future
const calculateNeededCrypto = (amountFiat, exchangeRate) => {
    // deal with decimal stuff, round correctly
    amountFiat = new Decimal(amountFiat);
    exchangeRate = new Decimal(exchangeRate);
    return roundCurrency(amountFiat.dividedBy(exchangeRate));
};

module.exports.handler = async (event) => {
    logHead("getPaymentPayload", event);

    const {identity} = event;
    // the provider (e.g. Coinbase) with which the wallet is associated
    const userWalletProvider = event.input.wallet.provider;
    // id of the Coinbase wallet from which the user would like to pay
    const userCoinbaseWalletId = event.input.wallet.id;
    // amount of the purchase in local (base) currency
    const amountFiat = event.input.cartInfo.amount;
    // local currency of the purchase
    const baseCurrency = event.input.cartInfo.currency;

    if (!amountFiat) {
        throw new Error("Please supply a purchase amount.");

    } else if (amountFiat <= 0) {
        throw new Error(`${amountFiat} is an invalid purchase amount.`);

    } else if (!baseCurrency) {
        throw new Error('Please supply a valid base currency.');

    } else if (!userWalletProvider) {
        throw new Error('Please supply a valid wallet provider.');

    } else if (!walletProviders[userWalletProvider]) {
        throw new Error(`${userWalletProvider} is invalid or a currently unsupported wallet provider.`);

    } else if (!baseCurrencies[baseCurrency]) {
        throw new Error(`${baseCurrency} is invalid or a currently unsupported base currency.`);

    } else if (!userCoinbaseWalletId) {
        throw new Error('Please supply a valid Coinbase wallet id.');

    }

    // todo: get this data from secure env variables
    // get authenticated client to Moon's Coinbase Pro account
    const authedGdaxClient = new gdax.AuthenticatedClient(
        key,
        secret,
        passphrase,
        sandboxURI
    );

    // get the user's Coinbase API keys from dynamodb
    const userCoinbaseApiKeys = await getCoinbaseApiKeys(identity.sub);

    // get Coinbase client to user's Coinbase account
    const userCoinbaseClient = new CoinbaseClient({
        apiKey: userCoinbaseApiKeys.key,
        apiSecret: userCoinbaseApiKeys.secret
    });

    // get the user's Coinbase wallet from which we want to draw funds
    const userCoinbaseWallet = await getCoinbaseWallet(userCoinbaseClient, userCoinbaseWalletId);
    const currencyToSell = userCoinbaseWallet.balance.currency;

    if(!quoteCurrencies[currencyToSell]){
        throw new Error('Selected wallet is not denominated in a currency we support');
    }

    // get the exchange rate between the base and quote currencies
    const exchangeRate = await getCoinbaseProExchangeRate(baseCurrency, currencyToSell);

    // calculate how much crypto is needed to complete the exchange - the amount to transfer from the user and sell
    const amountCrypto = calculateNeededCrypto(amountFiat, exchangeRate);
    console.log('Amount in fiat of the purchase = $' + amountFiat);
    console.log('Exchange rate = $' + exchangeRate);
    console.log('Amount in crypto to withdraw from user\'s Coinbase account = ' + amountCrypto);

    // check if there is enough crypto in the user's account to fund the purchase
    let userAccountBalance = userCoinbaseWallet.balance.amount;
    if(userAccountBalance < amountCrypto){
        throw new Error(`Insufficient funds! The user only has ${userAccountBalance} available.`);
    }else{
        console.log(`Sufficient funds! The user has ${userAccountBalance} available.`);
    }

    // send the crypto to Moon's Coinbase account from the user's Coinbase account
    const transaction = await sendFundsToCoinbaseUser(userCoinbaseWallet, moonCoinbaseAccountEmail, amountCrypto.toString());

    console.log('transaction: ' + util.inspect(transaction, false, null, true /* enable colors */));

    let transactionId = transaction.id;
    //todo: store the whole transaction in the db somewhere associated with transaction id and purchase id

    // transfer the money from moon's coinbase account to moon's coinbasePro account
    const moonCoinbaseAccountId = moonCoinbaseWalletIds[currencyToSell];
    const depositInfo = await sendFundsFromCoinbaseToCoinbasePro(authedGdaxClient, currencyToSell, amountCrypto, moonCoinbaseAccountId);
    // todo: log this in db? kinda useless info, but nice to have for the sake of completion

    console.log('deposit info: ' + util.inspect(depositInfo, false, null, true /* enable colors */));

    // Sell the crypto that is now in Moon's Coinbase Pro account
    const orderInfo = await placeSellMarketOrderOnCoinbasePro(authedGdaxClient, amountFiat, baseCurrency, currencyToSell);

    console.log('order info: ' + util.inspect(orderInfo, false, null, true /* enable colors */));

    // as long as sellCrypto did not throw an error, we assume that the sell order has been sent and all is well
    // now extract the amount that was actually sold, including fee info and send to the database
    // todo: extract order info and store in database

    // todo: issue the gift card

    logTail("getPaymentPayload", 'TBD card info');
};