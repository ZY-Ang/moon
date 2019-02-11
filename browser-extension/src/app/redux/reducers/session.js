/*
 * Copyright (c) 2018 moon
 */

import {
    ACTION_SET_AUTH_USER,
    ACTION_SET_AUTH_USER_TEMPORARY_ONBOARD_SKIP,
    ACTION_SET_SELECTED_WALLET,
    ACTION_SET_TAB
} from "./constants";
import {isValidAuthUser} from "../../utils/auth";
import {getDelayedHours} from "../../../utils/datetime";

/* -----------------     Initial State     ------------------ */

/**
 * Initial/ Fallback state
 */
const INITIAL_STATE = {
    authUser: null,
    selectedWallet: null,
    tab: {}
};


/* -----------------     Actions     ------------------ */
/**
 * Action to set the {@code authUser} in the store based on the specified action
 */
const applySetAuthUser = (state, action) => {
    if (isValidAuthUser(action.authUser)) {
        return {
            ...state,
            authUser: action.authUser,
            selectedWallet: state.selectedWallet || (action.authUser.wallets && action.authUser.wallets[0])
        };
    } else {
        return {
            ...state,
            authUser: null
        };
    }
};

/**
 * Action to set the {@code selectedWallet} in the store based on the specified action or persist last known wallet
 */
const applySetSelectedWallet = (state, action) => ({
    ...state,
    selectedWallet: action.selectedWallet || state.selectedWallet
});

/**
 * Action to set the {@code pageInformation} in the store based on the specified action
 */
const applySetTab = (state, action) => ({
    ...state,
    tab: action.tab
});

/* -----------------     Session Reducer     ------------------ */
/**
 * Session Reducer that manages all actions related to the store
 */
function sessionReducer(state = INITIAL_STATE, action) {
    const reducerMap = {
        [ACTION_SET_AUTH_USER]() {
            return applySetAuthUser(state, action);
        },
        [ACTION_SET_SELECTED_WALLET]() {
            return applySetSelectedWallet(state, action);
        },
        [ACTION_SET_AUTH_USER_TEMPORARY_ONBOARD_SKIP]() {
            return applySetAuthUser(state, {
                authUser: {
                    ...state.authUser,
                    onboardingSkipExpiry: getDelayedHours(168).toISOString()
                }
            });
        },
        [ACTION_SET_TAB]() {
            return applySetTab(state, action);
        }
    };
    if (!!action.type && !!reducerMap[action.type]) {
        return reducerMap[action.type]();
    } else {
        return state;
    }
}

export default sessionReducer;
