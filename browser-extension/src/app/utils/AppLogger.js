/*
 * Copyright (c) 2019 moon
 */

import Logger from "../../utils/Logger";
import {REQUEST_LOG} from "../../constants/events/appEvents";
import AppRuntime from "../browser/AppRuntime";

class AppLogger extends Logger {
    constructor(...args) {
        super(...args);
    }

    log() {
        const args = Array.prototype.slice.call(arguments);
        super.log(...args);

        AppRuntime.sendMessage(REQUEST_LOG, {
            type: "log",
            prefix: this.prefix,
            arguments: args
        }).catch();
    }

    info() {
        const args = Array.prototype.slice.call(arguments);
        super.info(...args);

        AppRuntime.sendMessage(REQUEST_LOG, {
            type: "info",
            prefix: this.prefix,
            arguments: args
        }).catch();
    }

    warn() {
        const args = Array.prototype.slice.call(arguments);
        super.warn(...args);

        AppRuntime.sendMessage(REQUEST_LOG, {
            type: "warn",
            prefix: this.prefix,
            arguments: args
        }).catch();
    }

    error() {
        const args = Array.prototype.slice.call(arguments);
        super.error(...args);

        AppRuntime.sendMessage(REQUEST_LOG, {
            type: "error",
            prefix: this.prefix,
            arguments: args
        }).catch();
    }
}

const appLogger = new AppLogger("App");
export default appLogger;
