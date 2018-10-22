/*
 * Copyright (c) 2018 moon
 */

// This file is to be run before any other scripts in the
// entry points so as to override behaviour for certain
// system-level functions.

if (process.env.NODE_ENV === 'production') {
    console.log("Pay with moon by clicking the moon icon!");
} else {
    console.log(`Moon running in ${process.env.NODE_ENV} environment`);
}
