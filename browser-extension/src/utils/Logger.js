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
    }

    log() {
        const args = Array.prototype.slice.call(arguments);
        if (process.env.NODE_ENV !== "production") {
            console.log(...args);
        }
    };

    info() {
        const args = Array.prototype.slice.call(arguments);
        if (process.env.NODE_ENV !== "production") {
            console.info(...args);
        }
    };

    warn() {
        const args = Array.prototype.slice.call(arguments);
        if (process.env.NODE_ENV !== "production") {
            console.warn(...args);
        }
    };

    error() {
        const args = Array.prototype.slice.call(arguments);
        if (process.env.NODE_ENV !== "production") {
            console.error(...args);
        }
    };
}

export const appLogger = new Logger("App");

export default Logger;
