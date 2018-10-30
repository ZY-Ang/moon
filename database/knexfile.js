/*
 * Copyright (c) 2018 moon
 */

// Update with your config settings.

module.exports = {

    development: {
        client: 'pg',
        connection: {
            host: 'moon-development-cluster.cluster-cpezx7ml533n.us-east-1.rds.amazonaws.com',
            user: 'moonadmin',
            password: 'MooningMonkeys123!',
            database: 'moon',
            port: 5432,
            ssl: true
        },
        migrations: {
            directory: __dirname + '/migrations'
        },
        seeds: {
            directory: __dirname + '/seeds/development'
        }
    },

    staging: {
        client: 'pg',
        connection: {
            host: '',
            user: '',
            password: '',
            database: 'moon',
            port: 5432,
            ssl: true
        },
        migrations: {
            directory: __dirname + '/migrations'
        },
        seeds: {
            directory: __dirname + '/seeds/development'
        }
    },

    production: {
        client: 'pg',
        connection: {
            host: '',
            user: '',
            password: '',
            database: 'moon',
            port: 5432,
            ssl: true
        },
        migrations: {
            directory: __dirname + '/migrations'
        },
        seeds: {
            directory: __dirname + '/seeds/development'
        }
    }

};
