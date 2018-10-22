/*
 * Copyright (c) 2018 moon
 */

const sgMail = require('../../constants/sendgrid/config');

const doSendWelcomeEmail = (email) => {
    const emailPayload = {
        to: email,
        from: 'donotreply@paywithmoon.com',
        subject: 'Getting Started with Moon',
        templateId: 'd-5bd2d05676ea4fdb98096d5499973bd8'
    };

    sgMail.send(emailPayload);
};

const doSendConnectCoinbaseCompleteEmail = (email) => {
    const emailPayload = {
        to: email,
        from: 'donotreply@paywithmoon.com',
        subject: 'You\'ve Linked Your Coinbase Account to Moon',
        templateId: 'd-5bd2d05676ea4fdb98096d5499973bd8' // TODO: replace with actual template ID
    };

    sgMail.send(emailPayload);
};

const doSendOrderConfirmationEmail = (email, site, baseCurrency, quoteCurrency, amountBase, amountQuote) => {
    const emailPayload = {
        to: email,
        from: 'donotreply@paywithmoon.com',
        subject: 'Order Details for Your Purchase Through Moon',
        templateId: 'd-5bd2d05676ea4fdb98096d5499973bd8', // TODO: replace with actual template ID
        substitutions: {
            site: site,
            base_currency: baseCurrency,
            quote_currency: quoteCurrency,
            amount_base: amountBase,
            amount_quote: amountQuote
        },
    };

    sgMail.send(emailPayload);
};

module.exports.doSendWelcomeEmail = doSendWelcomeEmail;
module.exports.doSendConnectCoinbaseCompleteEmail = doSendConnectCoinbaseCompleteEmail;
module.exports.doSendOrderConfirmationEmail = doSendOrderConfirmationEmail;