/*
 * Copyright (c) 2018 moon
 */

const exchangeRate = require("./src/exchangeRate");
const getPaymentPayload = require("./src/getPaymentPayload");
const notifyPaymentCompletion = require("./src/notifyPaymentCompletion");
const siteInformation = require("./src/siteInformation");
const user = require("./src/user");

module.exports.exchangeRate = exchangeRate.handler;
module.exports.getPaymentPayload = getPaymentPayload.handler;
module.exports.notifyPaymentCompletion = notifyPaymentCompletion.handler;
module.exports.siteInformation = siteInformation.handler;
module.exports.user = user.handler;
