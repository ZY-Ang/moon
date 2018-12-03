/*
 * Copyright (c) 2018 moon
 */

import {
    REQUEST_COINBASE_EXTRACT_API_KEYS,
    REQUEST_INJECT_APP, REQUEST_PAYMENT_COMPLETED_OFF_MODAL,
    REQUEST_UPDATE_AUTH_USER, REQUEST_UPDATE_TAB
} from "../constants/events/backgroundEvents";
import store from "./redux/store";
import {toggleApp} from "./index";
import AppRuntime from "./browser/AppRuntime";
import {getSendFailureResponseFunction, getSendSuccessResponseFunction} from "../browser/utils";
import {doExtractCoinbaseApiKeys} from "./wallets/coinbase";
import {updateAuthUser} from "./utils/auth";
import {injectButton} from "./buttonMoon";
import {handleErrors} from "../utils/errors";
import {
    ACTION_SET_APP_MODAL_ERROR_STATE,
    ACTION_SET_APP_MODAL_SUCCESS_STATE, ACTION_SET_TAB,
    ACTION_SET_UI_BLOCKER_STATE
} from "./redux/reducers/constants";

/**
 * Message handler for receiving messages from other extension processes
 * @param request {object} - message sent by the extension process
 * @param sender {object} - the extension process that sent the message
 * @param sendResponse {function(<object>)} - response callback to notify sender of completion or failure
 *
 * @see {@link https://developer.chrome.com/extensions/runtime#event-onMessage}
 */
const messageCenter = (request, sender, sendResponse) => {
    const sendSuccess = getSendSuccessResponseFunction(sendResponse);
    const sendFailure = getSendFailureResponseFunction(sendResponse);
    // Always ensure message extension sender is our own
    if (sender.id !== AppRuntime.id) {
        sendFailure(`${sender.id} is unauthorized`);
        return;
    }
    const messageResolver = {
        [REQUEST_INJECT_APP]() {
            store.dispatch({type: ACTION_SET_TAB, tab: request.tab});
            Promise.all([
                toggleApp(request.source),
                updateAuthUser(request.authUser).catch(handleErrors)
            ])
                .then(() => sendSuccess(`toggleApp(${request.source}) completed`))
                .catch(err => {
                    handleErrors(err);
                    sendFailure(`toggleApp(${request.source}) failed`);
                });
            injectButton();
            return true;
        },
        [REQUEST_UPDATE_AUTH_USER]() {
            updateAuthUser(request.authUser)
                .then(() => sendSuccess(`updateAuthUser(${JSON.stringify(request.authUser)}) completed`))
                .catch(err => {
                    handleErrors(err);
                    sendFailure(`updateAuthUser(${JSON.stringify(request.authUser)}) failed`);
                });
            return true;
        },
        [REQUEST_PAYMENT_COMPLETED_OFF_MODAL]() {
            if (!request.isSuccess) {
                store.dispatch({
                    type: ACTION_SET_UI_BLOCKER_STATE,
                    isActive: false
                });
                store.dispatch({
                    type: ACTION_SET_APP_MODAL_ERROR_STATE,
                    isActive: true,
                    text: "Something went wrong! Please try again."
                });
            } else {
                store.dispatch({
                    type: ACTION_SET_APP_MODAL_SUCCESS_STATE,
                    isActive: true,
                    text: "Success! Thank you for spreading the ❤ of cryptocurrency!"
                });
            }
            sendSuccess(true);
        },
        [REQUEST_UPDATE_TAB]() {
            store.dispatch({type: ACTION_SET_TAB, tab: request.tab});
            sendSuccess(true);
        },
        [REQUEST_COINBASE_EXTRACT_API_KEYS]() {
            doExtractCoinbaseApiKeys();
            sendSuccess("doExtractCoinbaseApiKeys() started");
        }
    };
    if (request.message && request.message in messageResolver) {
        return messageResolver[request.message]();
    } else {
        console.warn("Received an unknown message.\nRequest: ", request, "\nSender: ", sender);
        sendFailure("App messageCenter received an unknown request");
    }
};

export default messageCenter;
