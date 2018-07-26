/*
 * Copyright (c) 2018 moon
 */

if (process.env.BUILD_ENV === 'production') {
    // Disable client logging on production
    console.log("Pay with moon by clicking the moon icon!");
    console.log = () => {};
    console.info = () => {};
    console.warn = () => {};
    console.error = () => {};
    // TODO: Log to Cloud Service
} else {
    console.log(`Running in ${process.env.BUILD_ENV} environment`);
}
