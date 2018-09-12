/*
 * Copyright (c) 2018 moon
 */

const AWS = require("aws-sdk");
const Decimal = require('decimal.js');
const CoinbaseClient = require('coinbase').Client;
const gdax = require('gdax');

const publicClient = new gdax.PublicClient();

const key = 'your_api_key'; // todo: get from env
const secret = 'your_b64_secret'; // todo: get from env
const passphrase = 'your_passphrase'; // todo: get from env

const apiURI = 'https://api.gdax.com'; // todo: use in prod
const sandboxURI = 'https://api-public.sandbox.gdax.com';

const moonCoinbaseAccountEmail = "ken@kenco.io";

const authedGdaxClient = new gdax.AuthenticatedClient(
    key,
    secret,
    passphrase,
    sandboxURI
);

// Saving the Coinbase wallet ids here prevents us from making an additional call to the API
// These ids do not change unless we switch to another account
// todo: update these with the actual account ids
const COINBASE_WALLET_ID_ETH = '84d0b4d1-af06-5a2c-9010-a67b189ff43e';
const COINBASE_WALLET_ID_BTC = 'feeb0346-bfcd-57f4-9eab-7daedac7908e';
const COINBASE_WALLET_ID_BCH = '8d98dd01-b443-50dc-a101-12c8ead253be';
const COINBASE_WALLET_ID_LTC = '0f083601-0241-5433-929c-7db96902568e';

const getMoonCoinbaseWalletId = (currency) => {
    let walletId;
    switch(currency){
        case 'ETH':
            walletId = COINBASE_WALLET_ID_ETH;
            break;
        case 'BTC':
            walletId = COINBASE_WALLET_ID_BTC;
            break;
        case 'BCH':
            walletId = COINBASE_WALLET_ID_BCH;
            break;
        case 'LTC':
            walletId = COINBASE_WALLET_ID_LTC;
            break;
        default:
            console.log('Invalid Currency');
            throw new Error('Invalid Currency');
    }
    return walletId;
};

// Transfer crypto from Moon's Coinbase account to Moon's GDAX account
const transferCryptoFromCoinbaseToGdax = (currencyToSell, amountCrypto) => {
    let moonCoinbaseAccountId = getMoonCoinbaseWalletId(currencyToSell);
    const depositParams = {
        amount: amountCrypto,
        currency: currencyToSell,
        coinbase_account_id: moonCoinbaseAccountId
    };
    return authedGdaxClient.deposit(depositParams);
};

// Get the user's Coinbase keys from DynamoDB
const getCoinbaseKeys = (userId) => {
    let dynamodb = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
    let params = {
        TableName: "CoinbaseApiKeyTable",
        Key: {
            'userId': userId
        }
    };

    return dynamodb.get(params).promise()
        .then(data => {
            return data.Item;
        });
};

// Get a user's list of Coinbase wallets
const getCoinbaseWallets = (coinbaseKeys) => {
    return new Promise((resolve, reject) => {
        let userCoinbaseApiSecret = coinbaseKeys.secret;
        let userCoinbaseApiKey = coinbaseKeys.key;

        let coinbaseClient = new CoinbaseClient(
            {
                'apiKey': userCoinbaseApiKey,
                'apiSecret': userCoinbaseApiSecret,
                'version': '2018-04-10'
            });

        coinbaseClient.getAccounts({}, (err, accounts) => {
            if(err){
                return reject(err);
            }
            return resolve(accounts);
        });
    });
};

// Get a user's Coinbase wallet for the specified cryptocurrency
const getUserCoinbaseAccountForCurrency = (coinbaseKeys, currency) => {
    return new Promise((resolve, reject) => {
        getCoinbaseWallets(coinbaseKeys)
            .then(coinbaseWallets => {
                coinbaseWallets.forEach(wallet => {
                    if (wallet.balance.currency === currency)
                        return resolve(wallet);
                });
                return reject('Unable to find the specified wallet');
            });
    });
};

// Send money from the user's Coinbase account to Moon's Coinbase account
const sendCryptoToCoinbaseAccount = (sourceWallet, targetAccountEmail, amountCrypto) => {
    return new Promise((resolve, reject) => {
        let args = {
            to: targetAccountEmail,
            amount: amountCrypto,
            currency: sourceWallet.balance.currency,
            description: "Your purchase through Moon"
        };
        sourceWallet.sendMoney(args, (err, txn) => {
            if(err){
                return reject(err);
            }
            console.log('my txn id is: ' + txn.id);
            return resolve(txn);
        });
    });
};

// Get exchange rate from GDAX
const getGdaxExchangeRate = (cryptoCurrency, baseCurrency) => {
    if(baseCurrency !== 'USD'){
        throw new Error('USD is only supported at this time');
    }
    let currencyString;
    switch (cryptoCurrency) {
        case 'ETH':
            currencyString = 'ETH-USD';
            break;
        case 'BTC':
            currencyString = 'BTC-USD';
            break;
        case 'BCH':
            currencyString = 'BCH-USD';
            break;
        case 'LTC':
            currencyString = 'LTC-USD';
            break;
        default:
            console.log('Invalid Currency');
            throw new Error('Invalid Currency');
    }
    return authedGdaxClient
        .getProductTicker(currencyString)
        .then(response => {
            //console.log(response);
            return response['bid']; // use bid price since we are selling
        });
};

// Round up the 8th digit of an amount of currency if necessary. This is Coinbase's standard. Returns a string
const roundCurrency = (amount) => {
    amount = new Decimal(amount);
    let fixedDecimal = 8; // round up the 8th digit (Coinbase's standard)
    let ten = new Decimal(10);
    let mask = ten.pow(fixedDecimal);
    let roundedAmount = mask.times(amount).ceil().dividedBy(mask);
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

// Sell crypto on GDAX to receive amountFiat fiat dollars after the sale
// Account must have sufficient funds to complete the sale, including fees
const sellCryptoOnGdax = (cryptoCurrency, amountFiat) => {
    let currencyString;
    switch (cryptoCurrency) {
        case 'ETH':
            currencyString = 'ETH-USD';
            break;
        case 'BTC':
            currencyString = 'BTC-USD';
            break;
        case 'BCH':
            currencyString = 'BCH-USD';
            break;
        case 'LTC':
            currencyString = 'LTC-USD';
            break;
        default:
            console.log('Invalid Currency');
            throw new Error('Invalid Currency');
    }
    const params = {
        type: 'market',
        side: 'sell',
        funds: amountFiat, // fiat amount we want after the trade
        product_id: currencyString, // currency pair to trade
    };
    return authedGdaxClient.sell(params)
        .then(response => {
            console.log('sell order info: ' + util.inspect(response, false, null, true /* enable colors */));
        });
};

module.exports.handler = async (event) => {
    let currencyToSell = event.currency;
    let amountFiat = event.amount;
    let userId = event.userId;

    // amnt crypto to transfer from the user and sell - calculated from the amountFiat
    let amountCrypto;

    // user's Coinbase wallet from which we want to draw funds
    let userCoinbaseWallet;

    // get the user's Coinbase API keys from dynamodb
    return getCoinbaseKeys(userId)
        .then(userCoinbaseKeys => {
            // get the user's Coinbase wallet
            return getUserCoinbaseAccountForCurrency(userCoinbaseKeys, currencyToSell)
        })
        .then(wallet => {
            userCoinbaseWallet = wallet;
            // get the current exchange rate
            return getGdaxExchangeRate(currencyToSell, 'USD');//  fixme: conform coinbase base ccy
        })
        .then(exchangeRate => {
            // calculate how much crypto is needed to complete the exchange
            amountCrypto = calculateNeededCrypto(amountFiat, exchangeRate);
            console.log('Amount in fiat of the purchase = $' + amountFiat);
            console.log('Exchange rate = $' + exchangeRate);
            console.log('Amount in crypto to withdraw from user\'s Coinbase account = ' + amountCrypto);

            // check if there is enough crypto in the user's account to fund the purchase
            let userAccountBalance = userCoinbaseWallet.balance.amount;
            if(userAccountBalance < amountCrypto){
                throw new Error('Insufficient funds');
            }else{
                console.log('sufficient funds!')
            }
            // send the crypto to Moon's Coinbase account from the user's Coinbase account
            return sendCryptoToCoinbaseAccount(userCoinbaseWallet, moonCoinbaseAccountEmail, amountCrypto.toString());
        })
        .then(transaction => {
            console.log('transaction: ' + util.inspect(transaction, false, null, true /* enable colors */));

            let transactionId = transaction.id;
            let transactionStatus = transaction.status; // we want this to be "completed"

            //todo: store the whole transaction in the db somewhere

            if(transactionStatus !== 'completed'){
                // todo: log transactionid for reference
                throw new Error ('The transaction from user\'s Coinbase account to Moon\'s Coinbase account failed.');
            }
            // transfer the money from moon's coinbase account to moon's gdax account
            return transferCryptoFromCoinbaseToGdax(currencyToSell, amountCrypto);
        })
        .then(response => {
            // todo: log this id db? kinda useless info, but nice to have for the sake of completion
            console.log('deposit info: ' + util.inspect(response, false, null, true /* enable colors */));

            // Sell the crypto on that is now in Moon's Gdax account
            sellCryptoOnGdax(currencyToSell, amountFiat);
        })
        .then(response => {
            // as long as sellCrypto did not throw an error, we assume that the sell order has been sent and all is well
            // now extract the amount that was actually sold, including fee info and send to the database
            // todo: extract order info and store in database
        })
        .then(() => {
            // todo: issue the gift card
            return {}; // todo: fill in test
        })
        .catch(error => {
            console.error(error);
            return {};
        });
};