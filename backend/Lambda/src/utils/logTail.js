/*
 * Copyright (c) 2018 moon
 */

/**
 * Formats and logs the tail of a function for CloudWatch logs.
 * @param returnName - variable name of the return value
 * @param returnValue - stringify-able object representing what is to be returned from the function
 * @returns {void | *}
 */
const logTail = (returnName, returnValue) => console.log(`${returnName}:`, JSON.stringify(returnValue, 3));

module.exports = logTail;
