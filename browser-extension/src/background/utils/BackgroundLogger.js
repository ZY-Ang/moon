/*
 * Copyright (c) 2019 moon
 */

import Logger from "../../utils/Logger";
import uuid from "uuid/v4";
import moment from "moment";
import AWS from "../config/aws/AWS";
import {PUBLIC_CREDENTIALS} from "../config/aws/AWS";
import {replaceErrors} from "../../utils/error";
import BackgroundRuntime from "../browser/BackgroundRuntime";
import AuthUser from "../auth/AuthUser";

const INITIAL_STATE = {
    uuid: "unauthenticated"
};

class BackgroundLogger extends Logger {
    constructor(...args) {
        super(...args);
        this.logEvents = [];
        this.cloudwatchLogClient = new AWS.CloudWatchLogs({credentials: PUBLIC_CREDENTIALS});
        this.initialized = false;
        this.uuid = INITIAL_STATE.uuid;
        this.sequenceToken = null;
        this.putLogsPromise = Promise.resolve({nextSequenceToken: this.sequenceToken});
    }

    initializeLogStream = () => {
        // TODO: Add IP-GeoLocation service to Group or Stream
        this.logGroupName = `/browser.extension/v${BackgroundRuntime.getManifest().version}/${process.env.BROWSER}/${process.env.NODE_ENV}`;
        if (process.env.CIRCLE_BUILD_NUM) {
            this.logGroupName += `/circleci.${process.env.CIRCLE_BUILD_NUM}`;
        } else {
            this.logGroupName += "/ci.manual";
        }
        this.logStreamName = `${moment().format("YYYY-MM-DD")}`;
        const authUserUuid = AuthUser.getUuid();
        if (authUserUuid) {
            this.uuid = authUserUuid;
            this.logStreamName += `/${AuthUser.getEmail()}/${this.uuid}`;
        } else {
            this.uuid = INITIAL_STATE.uuid;
            this.logStreamName += `/${INITIAL_STATE.uuid}`;
        }

        this.logStreamName += `/${uuid()}`;

        // 1. Create Log Group (throws error if exist)
        return this.cloudwatchLogClient.createLogGroup({
            logGroupName: this.logGroupName
        })
            .promise()
            .catch(err => console.info("Unable to initialize log group", err.message))
            // 2. Put retention policy on log group to 7 days
            .then(() => this.cloudwatchLogClient.putRetentionPolicy({
                logGroupName: this.logGroupName,
                retentionInDays: 7
            }).promise())
            .catch(err => console.info("Unable to put retention policy on log group", err.message))
            // 3. Create Log Stream (Does not throw error if exist)
            .then(() => this.cloudwatchLogClient.createLogStream({
                logGroupName: this.logGroupName,
                logStreamName: this.logStreamName
            }).promise())
            .then(() => {
                this.initialized = true;
            })
            .catch(err => {
                console.info("Unable to initialize log stream", err);
            });
    };

    doPutLogEvents = (logEvents, nextSequenceToken) => new Promise((resolve, reject) => {
        if (!logEvents.length) {
            resolve({nextSequenceToken});
        }
        this.cloudwatchLogClient.putLogEvents({
            logEvents,
            logGroupName: this.logGroupName,
            logStreamName: this.logStreamName,
            sequenceToken: nextSequenceToken
        }, (err, data) => {
            if (err) {
                // Unable to log to cloudwatch. Ignore, log and reset token.
                this.sequenceToken = null;
                reject(err);

            } else if (data && data.nextSequenceToken) {
                this.sequenceToken = data.nextSequenceToken;
                resolve(data);

            }
        });
    });

    putLogEvents = () => {
        if (!this.initialized || this.uuid !== AuthUser.getUuid()) {
            this.initializeLogStream()
                .then(() => this.putLogEvents)
                .catch(err => console.error("BackgroundLogger Initialization failure: ", err));

        } else {
            // Try again later
            const logEvents = Array.from(this.logEvents);
            this.logEvents = [];
            this.putLogsPromise = this.putLogsPromise
                .then(({nextSequenceToken}) => this.doPutLogEvents(logEvents, nextSequenceToken))
                .catch(err => {
                    console.error("BackgroundLogger.putLogEvents if (err) exception: ", JSON.stringify(err, replaceErrors));
                    return {nextSequenceToken: this.sequenceToken};
                });
        }
    };

    resolveDynamicLogger(type, prefix, ..._arguments) {
        const resolver = {
            log: () => this.logDynamic(prefix, ..._arguments),
            info: () => this.infoDynamic(prefix, ..._arguments),
            warn: () => this.warnDynamic(prefix, ..._arguments),
            error: () => this.errorDynamic(prefix, ..._arguments),
        };

        if (!resolver[type]) {
            resolver.log();

        } else {
            resolver[type]();

        }
    }

    log() {
        const args = Array.prototype.slice.call(arguments);
        args.unshift(`[${this.prefix}]`, "[log]");
        super.log(...args);
        const message = args.join(" ");
        const timestamp = moment().valueOf();
        this.logEvents.push({message, timestamp});
    }

    logDynamic(prefix, ..._arguments) {
        const args = Array.prototype.slice.call(_arguments);
        args.unshift(`[${prefix}]`, "[log]");
        super.log(...args);
        const message = args.join(" ");
        const timestamp = moment().valueOf();
        this.logEvents.push({message, timestamp});
    }

    info() {
        const args = Array.prototype.slice.call(arguments);
        args.unshift(`[${this.prefix}]`, "[info]");
        super.info(...args);
        const message = args.join(" ");
        const timestamp = moment().valueOf();
        this.logEvents.push({message, timestamp});
    }

    infoDynamic(prefix, ..._arguments) {
        const args = Array.prototype.slice.call(_arguments);
        args.unshift(`[${prefix}]`, "[info]");
        super.info(...args);
        const message = args.join(" ");
        const timestamp = moment().valueOf();
        this.logEvents.push({message, timestamp});
    }

    warn() {
        const args = Array.prototype.slice.call(arguments);
        args.unshift(`[${this.prefix}]`, "[warn]");
        super.warn(...args);
        const message = args.join(" ");
        const timestamp = moment().valueOf();
        this.logEvents.push({message, timestamp});
    }

    warnDynamic(prefix, ..._arguments) {
        const args = Array.prototype.slice.call(_arguments);
        args.unshift(`[${prefix}]`, "[warn]");
        super.warn(...args);
        const message = args.join(" ");
        const timestamp = moment().valueOf();
        this.logEvents.push({message, timestamp});
    }

    error() {
        const args = Array.prototype.slice.call(arguments);
        args.unshift(`[${this.prefix}]`, "[error]");
        super.error(...args);
        const message = args.join(" ");
        const timestamp = moment().valueOf();
        this.logEvents.push({message, timestamp});
        this.putLogEvents();
    }

    errorDynamic(prefix, ..._arguments) {
        const args = Array.prototype.slice.call(_arguments);
        args.unshift(`[${prefix}]`, "[error]");
        super.error(...args);
        const message = args.join(" ");
        const timestamp = moment().valueOf();
        this.logEvents.push({message, timestamp});
        this.putLogEvents();
    }
}

const backgroundLogger = new BackgroundLogger("Background");
export default backgroundLogger;
