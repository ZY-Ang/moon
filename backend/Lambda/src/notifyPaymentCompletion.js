/*
 * Copyright (c) 2018 moon
 */

import logHead from "./utils/logHead";

const notifyPaymentCompletion = (event) => {
    logHead("notifyPaymentCompletion", event);
    return true;
};

export default notifyPaymentCompletion;
