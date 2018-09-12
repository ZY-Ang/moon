/*
 * Copyright (c) 2018 moon
 */

'use strict';

const exchangeRate = require("./exchangeRate");
const getPaymentPayload = require("./getPaymentPayload");
const user = require("./user");

module.exports.exchangeRate = exchangeRate.handler;
module.exports.getPaymentPayload = getPaymentPayload.handler;
module.exports.user = user.handler;
