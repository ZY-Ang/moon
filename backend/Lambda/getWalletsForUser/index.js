/*
 * Copyright (c) 2018 moon
 */

exports.handler = async (event) => {
    // TODO implement coinbase get wallets for a user - this is a test
    let wallets = [
        {
            id: '5',
            userId: '12',
            balance: '123.123'
        },{
            id: '5',
            userId: '12',
            balance: '123.123'
        }
    ];
    const response = JSON.stringify(wallets);
    console.log(response);
    return wallets;
};