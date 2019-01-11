/*
 * Copyright (c) 2019 moon
 */

import Logger from "../../utils/Logger";
import uuid from "uuid/v4";
import moment from "moment";
import * as AWS from "aws-sdk";
import {PUBLIC_CREDENTIALS} from "../config/aws/AWS";

const logGroupName = `browser-extension-${process.env.NODE_ENV}`;
const logStreamName = `${moment().toISOString()}${uuid()}`;

class BackgroundLogger extends Logger {
    constructor(prefix) {
        super(prefix);
        this.logEvents = [];
        (new AWS.CloudWatchLogs({credentials: PUBLIC_CREDENTIALS})).createLogStream({
            logGroupName,
            logStreamName
        });
    }

    log() {
        console.log({PUBLIC_CREDENTIALS});
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

    putLogEvent = () => {
        try {
            console.log({PUBLIC_CREDENTIALS});
            (new AWS.CloudWatchLogs({credentials: PUBLIC_CREDENTIALS})).putLogEvents({
                logEvents: this.logEvents,
                logGroupName,
                logStreamName,
                sequenceToken: this.sequenceToken
            }, (err, data) => {
                if (err) {
                    // Unable to log to cloudwatch. Ignore and just log.
                    console.error("BackgroundLogger.putLogEvent if (err) exception: ", err);
                } else if (data && data.nextSequenceToken) {
                    this.sequenceToken = data.nextSequenceToken;
                }
            });
            // Reset log events for next batch
            this.logEvents = [];
        } catch (e) {
            console.error("BackgroundLogger.putLogEvent catch (e) exception: ", e);
        }
    };

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
        this.putLogEvent();
    }
}

export const backgroundLogger = new BackgroundLogger("Background");

export default BackgroundLogger;
