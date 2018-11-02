/*
 * Copyright (c) 2018 moon
 */

module.exports.exchangeRate = require("./src/exchangeRate").handler;
module.exports.getPaymentPayload = require("./src/getPaymentPayload").handler;
module.exports.notifyPaymentCompletion = require("./src/notifyPaymentCompletion").handler;
module.exports.siteInformation = require("./src/siteInformation").handler;
module.exports.updateUser = require("./src/updateUser").handler;
module.exports.user = require("./src/user").handler;
