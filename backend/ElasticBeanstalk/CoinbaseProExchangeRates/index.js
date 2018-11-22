/*
 * Copyright (c) 2018 moon
 */
const express = require("express");
const {OrderbookSync} = require("gdax");

const supportedCodes = {
    "BTC-USD": true,
    "ETH-USD": true,
    "LTC-USD": true
};

const productIds = Object.keys(supportedCodes);

const ENDPOINT_REST_COINBASE_PRO = 'https://api.pro.coinbase.com';
const ENDPOINT_WEBSOCKET_COINBASE_PRO = "wss://ws-feed.pro.coinbase.com";

const API_KEY_PRODUCTION = 'd95c464fe72a443077d99d11fd79408c';
const API_PASSPHRASE_PRODUCTION = '79mxbffa74g';
const API_SECRET_PRODUCTION = 'J6AG2sPjhSLQCh01T/qD4dhwvVw2pqPB13I1hImhwe45/uw0HECB4r1fduz/pgOeBXoIMe3HS9EZpYB1mvbxNw==';

const WEBSOCKET_AUTH_CONFIG = {
    key: API_KEY_PRODUCTION,
    secret: API_SECRET_PRODUCTION,
    passphrase: API_PASSPHRASE_PRODUCTION
};

const app = express();

const orderbookSync = new OrderbookSync(
    productIds,
    ENDPOINT_REST_COINBASE_PRO,
    ENDPOINT_WEBSOCKET_COINBASE_PRO,
    WEBSOCKET_AUTH_CONFIG
);

orderbookSync.on('error', console.error);
orderbookSync.on('close', () => console.warn("close"));
orderbookSync.on('open', () => console.warn("open"));

const PORT = process.env.PORT || 8080;

const forceGetState = async (product) => {
    const state = orderbookSync.books[product].state();
    if (state && !!state.asks.length && !!state.bids.length) {
        return state;
    } else {
        return new Promise(resolve => setTimeout(() => resolve(forceGetState(product)), 500));
    }
};

const processRequest = (side) => (req, res) => {
    const {code, baseVol, quoteVol} = req.query;

    if (!code || !supportedCodes[code]) {
        console.error("Invalid code parameter: Please provide a valid and supported code.");
        res.status(400).send("Invalid code parameter: Please provide a valid and supported code.");

    } else if (!!baseVol && !!quoteVol) {
        console.error("Invalid volumes: Only one of baseVol or quoteVol can be supplied.");
        res.status(400).send("Invalid volumes: Only one of baseVol or quoteVol can be supplied.");

    } else if (!baseVol && !quoteVol) {
        forceGetState(code)
            .then(state => res.status(200).send(state[side][0]))
            .catch(err => {
                console.error(err);
                res.sendStatus(500);
            });

    } else if (!!baseVol && !quoteVol) {
        forceGetState(code)
            .then(state => {
                let i = -1, remainingVol = baseVol;
                while (remainingVol > 0) {
                    i++;
                    remainingVol -= (parseFloat(state[side][i].size) * parseFloat(state[side][i].price));
                }
                if (i === -1) {
                    res.status(400).send("Invalid baseVol. Probably negative.");
                } else if (i >= state[side].length) {
                    res.status(500).send("Invalid baseVol. Volume surpassed executable amount");
                } else {
                    res.status(200).send(state[side][i]);
                }
            })
            .catch(err => {
                console.error(err);
                res.status(500).send(`Runtime error: ${err.message}`);
            });
    } else {
        forceGetState(code)
            .then(state => {
                let i = -1, remainingVol = quoteVol;
                while (remainingVol > 0) {
                    i++;
                    remainingVol -= parseFloat(state[side][i].size);
                }
                if (i === -1) {
                    res.status(400).send("Invalid baseVol. Probably negative.");
                } else if (i >= state[side].length) {
                    res.status(500).send("Invalid baseVol. Volume surpassed executable amount");
                } else {
                    res.status(200).send(state[side][i]);
                }
            })
            .catch(err => {
                console.error(err);
                res.status(500).send(`Runtime error: ${err.message}`);
            });
    }
};

app.get('/bid', processRequest("bids"));
app.get('/buy', processRequest("bids"));
app.get('/ask', processRequest("asks"));
app.get('/sell', processRequest("asks"));

app.listen(PORT, error => {
    if (error) throw error;
    console.log(`Server running on port ${PORT}, in ${process.env.NODE_ENV || 'development'} environment`);
});
