/*
 * Copyright (c) 2018 moon
 */

const CONFIG_AGCOD = process.env.NODE_ENV === 'production'
    ? {
        endpoint: {
            NA: {
                host: "agcod-v2.amazon.com",
                region: "us-east-1",
                countries: ["US", "CA", "MX"]
            },
            EU: {
                host: "agcod-v2-eu.amazon.com",
                region: "eu-west-1",
                countries: ["IT", "ES", "DE", "FR", "UK"]
            },
            FE: {
                host: "agcod-v2-fe.amazon.com",
                region: "us-west-2",
                countries: ["JP", "AU"]
            }
        },
        partnerId: "Ken60",
        credentials: {
            accessKeyId: "AKIAJ2STY2SNIRBSDSSA",
            secretAccessKey: "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"
        }
    } : {
        partnerId: "Ken60",
        credentials: {
            accessKeyId: "AKIAJ2STY2SNIRBSDSSA",
            secretAccessKey: "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"
        }
    };

module.exports.CONFIG_AGCOD = CONFIG_AGCOD;
