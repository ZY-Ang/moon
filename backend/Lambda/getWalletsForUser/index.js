/*
 * Copyright (c) 2018 moon
 */

const CoinbaseClient = require('coinbase').Client;
const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});

const util = require('util');

// get the user's api key and api secret from dynamodb
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

        coinbaseClient.getAccounts({}, function(err, accounts) {
            if(err){
                return reject(err);
            }
            let wallets = [];
            accounts.forEach(account => {
                wallets.push({
                    id: account.id,
                    name: account.name,
                    balance: account.balance.amount,
                    currency: account.balance.currency
                })
            });
            return resolve(wallets);
        });
    });
};

exports.handler = async (event) => {
    let userId = event.idToken;

    // todo: assume identity based on event.idToken, create a role for lambda to access dynamo on behalf of user

    // todo: handle the case of no coinbase keys found
    return getCoinbaseKeys(userId)
        .then(coinbaseKeys => {return getCoinbaseWallets(coinbaseKeys)})
        .then(wallets => {return wallets})
        .catch(error => {
            console.log(error);
            return {error: 'An error occurred fetching wallet list.' };
        });
};