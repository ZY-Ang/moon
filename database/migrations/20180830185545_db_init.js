const {
    TABLE_LEDGER, TABLE_ORDERS,
    COLUMN_ID, COLUMN_AMOUNT_CRYPTOCURRENCY, COLUMN_AMOUNT_USD, COLUMN_CRYPTOCURRENCY_TYPE,
    COLUMN_UUID, COLUMN_WALLET_ID, COLUMN_WEBWITE

} = require("../constants/database");

exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable(TABLE_LEDGER, (table) => {
            table.increments(COLUMN_ID).primary();
            // TODO: Alex fill in some outline of a ledger
            table.timestamps(true, true); // adds created_at and updated_at columns
        }),
        knex.schema.createTable(TABLE_ORDERS, (table) => {
            table.increments(COLUMN_ID).primary();
            table.uuid(COLUMN_UUID);
            table.string(COLUMN_AMOUNT_USD);
            table.string(COLUMN_AMOUNT_CRYPTOCURRENCY);
            table.string(COLUMN_CRYPTOCURRENCY_TYPE);
            table.string(COLUMN_WALLET_ID);
            table.string(COLUMN_WEBWITE);
            table.timestamps(true, true); // adds created_at and updated_at columns
        })
    ]);
};

exports.down = function(knex, Promise) {
    if(process.env.NODE_ENV !== 'production'){
        return Promise.all([
            knex.schema.dropTableIfExists(TABLE_LEDGER),
            knex.schema.dropTableIfExists(TABLE_ORDERS),
        ]);
    }
};
