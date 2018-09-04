/*
 * Copyright (c) 2018 moon
 */

const gdax = require('gdax');
const publicClient = new gdax.PublicClient();

exports.handler = async (event) => {

    let currencyString;
    switch (event.currency) {
        case 'ETHER':
            currencyString = 'ETH-USD';
            break;
        case 'BITCOIN':
            currencyString = 'BTC-USD';
            break;
        case 'BITCOINCASH':
            currencyString = 'BCH-USD';
            break;
        case 'LITECOIN':
            currencyString = 'LTC-USD';
            break;
        default:
            console.log('Invalid Currency');
            return {error: 'Invalid Currency'};
    }

    return publicClient.getProductTicker(currencyString)
        .then((tickerInformation) => {
            return {amount: tickerInformation.price, currency: event.currency};
        })
        .catch((error) => {
            console.log('Error: ' + error);
        });
};