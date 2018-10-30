/*
 * Copyright (c) 2018 moon
 */

/**
 * @code {database} is the dynamic database export
 *      to be generated depending on whether the
 *      application is being run in development,
 *      staging or production mode.
 * @type Knex
 */
const environment = process.env.NODE_ENV || 'development';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);

// TODO: Organize unique columns hierarchically by table
module.exports = {
    database: database,
    TABLE_LEDGER: 'ledger',
    TABLE_ORDERS: 'orders',
    COLUMN_ID: 'id',
    COLUMN_UUID: 'uuid',
    COLUMN_EMAIL: 'email',
    COLUMN_CREATED_AT: 'created_at',
    COLUMN_UPDATED_AT: 'updated_at',
    COLUMN_AMOUNT_USD: 'amount_usd',
    COLUMN_AMOUNT_CRYPTOCURRENCY: 'amount_cryptocurrency',
    COLUMN_CRYPTOCURRENCY_TYPE: 'cryptocurrency_type',
    COLUMN_WEBWITE: 'website',
    COLUMN_WALLET_ID: 'wallet_id'
};
