/*
 * Copyright (c) 2019 moon
 */

/**
 * Custom logging system that extends
 * {@class console} and various others
 */
class Logger {
    constructor(prefix) {
        this.prefix = prefix;
        this.stack = [];
    }

    pushToStack = (logLine) => {
        this.stack.push(logLine);
    };

    log() {
        const args = Array.prototype.slice.call(arguments);
        this.pushToStack(`[${this.prefix}][log]${args.join(" ")}`);
        if (process.env.NODE_ENV !== "production") {
            console.log(...args);
        }
    };

    info() {
        const args = Array.prototype.slice.call(arguments);
        this.pushToStack(`[${this.prefix}][info]${args.join(" ")}`);
        if (process.env.NODE_ENV !== "production") {
            console.info(...args);
        }
    };

    warn() {
        const args = Array.prototype.slice.call(arguments);
        this.pushToStack(`[${this.prefix}][warn]${args.join(" ")}`);
        if (process.env.NODE_ENV !== "production") {
            console.warn(...args);
        }
    };

    // TODO: Log log stack (including other log levels) to cloudwatch on error, clear stack
    error() {
        const args = Array.prototype.slice.call(arguments);
        this.pushToStack(`[${this.prefix}][error]${args.join(" ")}`);
        if (process.env.NODE_ENV !== "production") {
            console.error(...args);
        }
    };
}

export default Logger;
