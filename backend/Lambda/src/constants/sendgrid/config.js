/*
 * Copyright (c) 2018 moon
 */

const sgMail = require('@sendgrid/mail');

const SENDGRID_API_KEY_ID = 'KPITGfy7QwmeiR7KUeZvsA';

const SENDGRID_API_KEY_SECRET = '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';

sgMail.setApiKey(SENDGRID_API_KEY_SECRET);

module.exports = sgMail;
