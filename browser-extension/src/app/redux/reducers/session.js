/*
 * Copyright (c) 2018 moon
 */

import {
    ACTION_SET_AUTH_USER,
    ACTION_SET_SITE_INFORMATION
} from "./constants";
import {isValidAuthUser} from "../../utils/auth";

/* -----------------     Initial State     ------------------ */

/**
 * Initial/ Fallback state
 */
const INITIAL_STATE = {
    authUser: null,
    siteInformation: {
        isLoading: true
    }
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
 * Action to set the {@code siteInformation} in the store based on the specified action
 */
const applySetSiteInformation = (state, action) => ({
    ...state,
    siteInformation: action.siteInformation
});

/* -----------------     Session Reducer     ------------------ */
/**
 * Session Reducer that manages all actions related to the store
 */
function sessionReducer(state = INITIAL_STATE, action) {
    const reducerMap = {
        [ACTION_SET_AUTH_USER](){
            return applySetAuthUser(state, action);
        },
        [ACTION_SET_SITE_INFORMATION](){
            return applySetSiteInformation(state, action);
        }
    };
    if (!!action.type && !!reducerMap[action.type]) {
        return reducerMap[action.type]();
    } else {
        return state;
    }
}

export default sessionReducer;
