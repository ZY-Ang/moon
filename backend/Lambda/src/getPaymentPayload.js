/*
 * Copyright (c) 2018 moon
 */
const Decimal = require("decimal.js");
const CoinbaseClient = require("coinbase").Client;
const gdax = require("gdax");
const logHead = require("./utils/logHead");
const logTail = require("./utils/logTail");
const baseCurrencies = require("./constants/exchanges/coinbasePro/currencies").base;
const quoteCurrencies = require("./constants/exchanges/coinbasePro/currencies").quote;
const walletProviders = require("./constants/walletProviders");
const getAmazonGiftCard = require("./services/paymentProviders/amazonIncentives/getAmazonGiftCard");
const getCoinbaseApiKeys = require("./services/walletProviders/coinbase/getCoinbaseApiKeys");
const getCoinbaseWallets = require("./services/walletProviders/coinbase/getCoinbaseWallets");
const getCoinbaseCurrentUser = require("./services/walletProviders/coinbase/getCoinbaseCurrentUser");
const transferToCoinbasePro = require("./services/walletProviders/coinbase/transferToCoinbasePro");
const transferToCoinbaseUser = require("./services/walletProviders/coinbase/transferToCoinbaseUser");
const getCoinbaseProExchangeRate = require("./services/exchangeRateProviders/coinbasePro/getExchangeRate");
const placeCoinbaseProSellMarketOrder = require("./services/exchanges/coinbasePro/placeSellMarketOrder");
const {coinbaseProUri, coinbaseProKey, coinbaseProSecret, coinbaseProPassphrase} = require("./constants/exchanges/coinbasePro/config");
const moonCoinbaseWalletIds = require("./constants/exchanges/coinbasePro/config").coinbaseWalletIds;
const moonCoinbaseAccountEmail = require("./constants/exchanges/coinbasePro/config").coinbaseAccountEmail;

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
    const userWalletProvider = event.arguments.input.wallet.provider;
    // id of the Coinbase wallet from which the user would like to pay
    const userCoinbaseWalletId = event.arguments.input.wallet.id;
    // amount of the purchase in local (base) currency
    const amountFiat = event.arguments.input.cartInfo.amount;
    // local currency of the purchase
    const baseCurrency = event.arguments.input.cartInfo.currency;

    if (!amountFiat) {
        throw new Error("Please supply a purchase amount.");

    // only check if amount < 10 in production so we can test with .01USD in development
    } else if ((process.env.NODE_ENV === 'production' && amountFiat < 10) || amountFiat > 2000) {
        // Coinbase Pro has a min sell order of $10 USD and Amazon Incentives issues a maximum of a $2000 USD gift card
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

    // get authenticated client to Moon's Coinbase Pro account
    const authedGdaxClient = new gdax.AuthenticatedClient(
        coinbaseProKey,
        coinbaseProSecret,
        coinbaseProPassphrase,
        coinbaseProUri
    );

    // get the user's Coinbase API keys from dynamodb
    const userCoinbaseApiKeys = await getCoinbaseApiKeys(identity.sub);

    // get Coinbase client to user's Coinbase account
    const userCoinbaseClient = new CoinbaseClient({
        apiKey: userCoinbaseApiKeys.key,
        apiSecret: userCoinbaseApiKeys.secret
    });

    // get user's coinbase user object and wallets - these are returned in the PaymentPayload
    const [userCoinbaseWallets, coinbaseUser] = await Promise.all([
            getCoinbaseWallets(userCoinbaseClient),
            getCoinbaseCurrentUser(userCoinbaseClient)
        ]);

    // get the user's Coinbase wallet from which we want to draw funds
    const userCoinbaseWallet = userCoinbaseWallets.find(wallet => wallet.id === userCoinbaseWalletId);

    const currencyToSell = userCoinbaseWallet.balance.currency;

    if (!quoteCurrencies[currencyToSell]) {
        throw new Error('Selected wallet is not denominated in a currency we support');
    }

    // get the exchange rate between the base and quote currencies
    const exchangeRate = await getCoinbaseProExchangeRate(currencyToSell, baseCurrency);

    // calculate how much crypto is needed to complete the exchange - the amount to transfer from the user and sell
    const amountCrypto = calculateNeededCrypto(amountFiat, exchangeRate.bid);
    console.log('Amount in fiat of the purchase = $' + amountFiat);
    console.log('Exchange rate = $' + exchangeRate);
    console.log('Amount in crypto to withdraw from user\'s Coinbase account = ' + amountCrypto);

    // check if there is enough crypto in the user's account to fund the purchase
    let userAccountBalance = userCoinbaseWallet.balance.amount;
    if (userAccountBalance < amountCrypto) {
        throw new Error(`Insufficient funds! The user only has ${userAccountBalance} available.`);
    } else {
        console.log(`Sufficient funds! The user has ${userAccountBalance} available.`);
    }

    // send the crypto to Moon's Coinbase account from the user's Coinbase account
    const transaction = await transferToCoinbaseUser(userCoinbaseWallet, moonCoinbaseAccountEmail, amountCrypto.toString());

    console.log('transaction: ' + JSON.stringify(transaction, 3));

    let transactionId = transaction.id;
    //todo: store the whole transaction in the db somewhere associated with transaction id and purchase id

    // transfer the money from moon's coinbase account to moon's coinbasePro account
    const moonCoinbaseAccountId = moonCoinbaseWalletIds[currencyToSell];
    const depositInfo = await transferToCoinbasePro(authedGdaxClient, amountCrypto, currencyToSell, moonCoinbaseAccountId);
    // todo: log this in db? kinda useless info, but nice to have for the sake of completion

    console.log('deposit info: ' + JSON.stringify(depositInfo, 3));

    // Sell the crypto that is now in Moon's Coinbase Pro account
    const orderInfo = await placeCoinbaseProSellMarketOrder(authedGdaxClient, amountFiat, baseCurrency, currencyToSell);

    console.log('order info: ' + JSON.stringify(orderInfo, 3));

    // as long as sellCrypto did not throw an error, we assume that the sell order has been sent and all is well
    // now extract the amount that was actually sold, including fee info and send to the database
    // todo: extract order info and store in database

    // issue the gift card
    const giftcardInfo = await getAmazonGiftCard(amountFiat, baseCurrency);

    const giftcardClaimCode = giftcardInfo['gcClaimCode'];


    // todo: fix this - call getUser
    const user = {
        coinbaseInfo: {
            user: coinbaseUser,
            wallets: userCoinbaseWallets && userCoinbaseWallets.map(wallet => ({
                id: wallet.id,
                name: wallet.name,
                currency: wallet.balance && wallet.balance.currency,
                balance: wallet.balance && wallet.balance.amount
            }))
        }
    };

    const paymentPayload = {
        id: 'id_tbd',
        data: giftcardClaimCode,
        balance: amountFiat,
        currency: baseCurrency,
        user
    };

    logTail("getPaymentPayload", paymentPayload);

    return paymentPayload;
};