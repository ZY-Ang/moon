/*
 * Copyright (c) 2018 moon
 */

const gdax = require('gdax');
const publicClient = new gdax.PublicClient();

exports.handler = async (event) => {

    let currencyString;
    switch (event.currency) {
        case 'Ether':
            currencyString = 'ETH-USD';
            break;
        case 'Bitcoin':
            currencyString = 'BTC-USD';
            break;
        case 'Bitcoin Cash':
            currencyString = 'BCH-USD';
            break;
        case 'Litecoin':
            currencyString = 'LTC-USD';
            break;
        default:
            console.log('Invalid Currency');
            return {error: 'Invalid Currency'};
    }

    return publicClient.getProductTicker(currencyString)
        .then((tickerInformation) => {
            return tickerInformation.price;
        })
        .catch((error) => {
            console.log('Error: ' + error);
        });
};