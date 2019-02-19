/*
 * Copyright (c) 2018 moon
 */

import logHead from "./utils/logHead";
import logTail from "./utils/logTail";
import updatePaymentPayloadRecord from "./services/paymentPayloaders/updatePaymentPayloadRecord";
import {URL_CLOUDWATCH_HOME} from "./constants/aws/CloudWatchLogs";

const notifyPaymentCompletion = async (event, context) => {
    logHead("notifyPaymentCompletion", event);

    const {
        logGroupName: notifyPaymentCompletionLogGroupName,
        logStreamName: notifyPaymentCompletionLogStreamName
    } = context;
    const {arguments: args} = event;

    const {id: paymentPayloadId, notifyPaymentCompletionPayloadInput} = args.input;
    const notifyPaymentCompletionLogEventViewerURL = URL_CLOUDWATCH_HOME +
        "?region=" + process.env.AWS_REGION + "#logEventViewer;" +
        "group=" + notifyPaymentCompletionLogGroupName + ";" +
        "stream=" + notifyPaymentCompletionLogStreamName;
    await updatePaymentPayloadRecord(paymentPayloadId, Object.assign({
        notifyPaymentCompletionLogGroupName,
        notifyPaymentCompletionLogStreamName,
        notifyPaymentCompletionLogEventViewerURL
    }, notifyPaymentCompletionPayloadInput));

    const paymentCompletionPayload = {
        id: paymentPayloadId,
        notified: true
    };
    logTail("paymentCompletionPayload", paymentCompletionPayload);
    return paymentCompletionPayload;
};

export default notifyPaymentCompletion;
