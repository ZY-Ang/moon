/*
 * Copyright (c) 2018 moon
 */

import {ACTION_SET_AUTH_USER, ACTION_SET_AUTH_USER_TABLE} from "./constants";
import {isValidAuthUser} from "../../auth";

/* -----------------     Initial State     ------------------ */

/**
 * Initial/ Fallback state
 */
const INITIAL_STATE = {
    authUser: null,
    authUserTable: null
};


/* -----------------     Actions     ------------------ */
/**
 * Action to set the {@code authUser} in the store based on the specified action
 */
const applySetAuthUser = (state, action) => {
    if (isValidAuthUser(action.authUser)) {
        return {
            ...state,
            authUser: action.authUser
        };
    } else {
        return {
            ...state,
            authUser: null
        }
    }
};

/**
 * Action to set the {@code authUserTable} in the store based on the specified action
 */
const applySetAuthUserTable = (state, action) => ({
    ...state,
    authUserTable: action.authUserTable
});

/* -----------------     Session Reducer     ------------------ */
/**
 * Session Reducer that manages all actions related to the store
 */
function sessionReducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case ACTION_SET_AUTH_USER:
            return applySetAuthUser(state, action);
        case ACTION_SET_AUTH_USER_TABLE:
            return applySetAuthUserTable(state, action);
        default:
            return state;
    }
}

export default sessionReducer;
