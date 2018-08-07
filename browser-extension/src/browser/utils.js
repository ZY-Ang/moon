/*
 * Copyright (c) 2018 moon
 */

/**
 * Constructs a success response sender for use in
 * {@function messageCenter} to notify the message
 * sender of a successful operation.
 *
 * @param browserSendResponse -
 *      the sendResponse function provided
 *      in the callbacks for the
 *      {@code onMessage.addListener} API
 *      callbacks
 * @returns {function(*=): *}
 */
export const getSendSuccessResponseFunction = (browserSendResponse) =>
    /**
     * Sends a well formed response to the message
     * sender, notifying of a successful operation
     * @param response<any>
     */
    (response) => browserSendResponse({
        success: true,
        response: response
    });

/**
 * Constructs a error response sender for use in
 * {@function messageCenter} to notify the message
 * sender of a erroneous operation.
 *
 * @param browserSendResponse -
 *      the sendResponse function provided
 *      in the callbacks for the
 *      {@code onMessage.addListener} API
 *      callbacks
 * @returns {function(*=): *}
 */
export const getSendFailureResponseFunction = (browserSendResponse) =>
    /**
     * Sends a well formed response to the message
     * sender, notifying of a erroneous operation
     * @param response<any>
     */
    (response) => browserSendResponse({
        success: false,
        response: response
    });
