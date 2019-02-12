/*
 * Copyright (c) 2018 moon
 */

import logHead from "./utils/logHead";
import logTail from "./utils/logTail";
import updatePaymentPayloadRecord from "./services/paymentPayloaders/updatePaymentPayloadRecord";

const notifyPaymentCompletion = async (event, context) => {
    logHead("notifyPaymentCompletion", event);

    const {
        logGroupName: notifyPaymentCompletionLogGroupName,
        logStreamName: notifyPaymentCompletionLogStreamName
    } = context;
    const {arguments: args} = event;

    const {id: paymentPayloadId, notifyPaymentCompletionPayloadInput} = args.input;
    // TODO: Create direct link to notifyPaymentCompletionLogURL via URL parameters in the AWS console to make debugging life easier
    await updatePaymentPayloadRecord(paymentPayloadId, Object.assign({
        notifyPaymentCompletionLogGroupName,
        notifyPaymentCompletionLogStreamName
    }, notifyPaymentCompletionPayloadInput));

    const paymentCompletionPayload = {
        id: paymentPayloadId,
        notified: true
    };
    logTail("paymentCompletionPayload", paymentCompletionPayload);
    return paymentCompletionPayload;
};

export default notifyPaymentCompletion;
