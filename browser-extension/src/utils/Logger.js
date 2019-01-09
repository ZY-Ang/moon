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

    log() {
        const args = Array.prototype.slice.call(arguments);
        this.stack.concat(`[${this.prefix}][log]${args.join(" ")}`);
        if (process.env.NODE_ENV !== "production") {
            console.log.apply(console, args);
        }
    };

    info() {
        const args = Array.prototype.slice.call(arguments);
        this.stack.concat(`[${this.prefix}][info]${args.join(" ")}`);
        if (process.env.NODE_ENV !== "production") {
            console.info.apply(console, args);
        }
    };

    warn() {
        const args = Array.prototype.slice.call(arguments);
        this.stack.concat(`[${this.prefix}][warn]${args.join(" ")}`);
        if (process.env.NODE_ENV !== "production") {
            console.warn.apply(console, args);
        }
    };

    // TODO: Log log stack (including other log levels) to cloudwatch on error
    error() {
        const args = Array.prototype.slice.call(arguments);
        this.stack.concat(`[${this.prefix}][error]${args.join(" ")}`);
        if (process.env.NODE_ENV !== "production") {
            console.error.apply(console, args);
        }
    };
}

export default Logger;
