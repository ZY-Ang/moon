/*
 * Copyright (c) 2018 moon
 */

// This file is to be run before any other scripts in the
// entry points so as to override behaviour for certain
// system-level functions.

if (process.env.BUILD_ENV === 'production') {
    // Disable client logging on production
    console.log("Pay with moon by clicking the moon icon!");
    console.log = () => {};
    console.info = () => {};
    console.warn = () => {};
    console.error = () => {};
    // TODO: Log to Cloud Service
} else {
    console.log(`Running in ${(process.env.BUILD_ENV || 'development')} environment`);
}
