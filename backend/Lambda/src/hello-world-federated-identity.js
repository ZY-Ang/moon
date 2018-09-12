/*
 * Copyright (c) 2018 moon
 */

exports.handler = async (event, context, callback) => {
    try {
        const fibResult = fib(event.fib);
        callback(null, {
            authorized: true,
            fibResult: fibResult,
            event: event,
            context: context
        });
    } catch (err) {
        callback(err);
    }
    // return `You are authorized.\nFibResult: ${fibResult}\nEvent:`;// 'You are authorized\nFibResult: , event: ' + JSON.stringify(event);
};

const fib = (n) => {
    if (n < 2) {
        return n;
    }
    return fib(n - 1) + fib(n - 2);
};
