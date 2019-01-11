/*
 * Copyright (c) 2019 moon
 */

import Logger from "../../utils/Logger";
import uuid from "uuid/v4";
import moment from "moment";
import AWS from "../config/aws/AWS";
import {PUBLIC_CREDENTIALS} from "../config/aws/AWS";

class BackgroundLogger extends Logger {
    constructor(prefix) {
        super(prefix);
        this.logEvents = [];
        this.cloudwatchLogClient = new AWS.CloudWatchLogs({credentials: PUBLIC_CREDENTIALS});
        this.initialized = false;
        this.initializeLogStream();
    }

    initializeLogStream = () => {
        // TODO: Add IP-GeoLocation service to Group or Stream
        this.logGroupName = `browser-extension-${process.env.NODE_ENV}`;
        this.logStreamName = `${moment().format("YYYY-MM-DD")}-${uuid()}`;
        this.cloudwatchLogClient.createLogStream({
            logGroupName: this.logGroupName,
            logStreamName: this.logStreamName
        }, (err) => {
            if (err) {
                console.error("Unable to initialize log stream");
            } else {
                this.initialized = true;
            }
        });
    };

    putLogEvents = () => {
        if (!this.initialized) {
            this.initializeLogStream();

        } else {
            // Try again later
            try {
                this.cloudwatchLogClient.putLogEvents({
                    logEvents: this.logEvents,
                    logGroupName: this.logGroupName,
                    logStreamName: this.logStreamName,
                    sequenceToken: this.sequenceToken
                }, (err, data) => {
                    if (err) {
                        // Unable to log to cloudwatch. Ignore and just log.
                        console.error("BackgroundLogger.putLogEvents if (err) exception: ", err);
                    } else if (data && data.nextSequenceToken) {
                        this.sequenceToken = data.nextSequenceToken;
                    }
                });
                // Reset log events for next batch
                this.logEvents = [];
            } catch (e) {
                console.error("BackgroundLogger.putLogEvents catch (e) exception: ", e);
            }
        }
    };

    log() {
        const args = Array.prototype.slice.call(arguments);
        super.log(...args);
        args.unshift(`[${this.prefix}]`, "[log]");
        const message = args.join(" ");
        const timestamp = moment().valueOf();
        this.logEvents.push({message, timestamp});
    }

    appLog() {
        // TODO: Implement
    }

    info() {
        const args = Array.prototype.slice.call(arguments);
        super.info(...args);
        args.unshift(`[${this.prefix}]`, "[info]");
        const message = args.join(" ");
        const timestamp = moment().valueOf();
        this.logEvents.push({message, timestamp});
    }

    warn() {
        const args = Array.prototype.slice.call(arguments);
        super.warn(...args);
        args.unshift(`[${this.prefix}]`, "[warn]");
        const message = args.join(" ");
        const timestamp = moment().valueOf();
        this.logEvents.push({message, timestamp});
    }

    error() {
        const args = Array.prototype.slice.call(arguments);
        super.error(...args);
        args.unshift(`[${this.prefix}]`, "[error]");
        const message = args.join(" ");
        const timestamp = moment().valueOf();
        this.logEvents.push({message, timestamp});
        this.putLogEvents();
    }
}

export const backgroundLogger = new BackgroundLogger("Background");

export default BackgroundLogger;
