/*
 * Copyright (c) 2018 moon
 */

let Client = require('coinbase').Client;

exports.handler = async (event) => {

    // todo: get the user's apikey and api secret from dynamodb
    let client = new Client({'apiKey': mykey, 'apiSecret': mysecret});

    return client.getAccounts().then((accounts) => {
            let wallets = [];
            accounts.forEach(account => {
                console.log('my bal: ' + account.balance.amount + ' for ' + account.name);
                wallets.push({
                    balance: account.balance.amount,
                    name: account.name
                })
            });
            console.log(wallets);
            return wallets;
        }).catch(error => {
            console.log('Error accessing user\'s accounts: ' + error);
        });
};