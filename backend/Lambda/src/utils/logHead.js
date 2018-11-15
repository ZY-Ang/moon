/*
 * Copyright (c) 2018 moon
 */

/**
 * Formats and logs the head of a function for CloudWatch logs.
 * @param functionName - name of the function
 * @param _arguments - stringify-able object representing the arguments received by the function
 * @returns {void | *}
 */
const logHead = (functionName, _arguments) => console.log(`${functionName}:`, JSON.stringify(_arguments, 3));

export default logHead;
