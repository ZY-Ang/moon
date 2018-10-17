/*
 * Copyright (c) 2018 moon
 */

import {
    ACTION_SET_IS_APP_ACTIVE,
    ACTION_SET_AUTH_USER,
    ACTION_SET_SITE_INFORMATION,
    ACTION_TOGGLE_IS_APP_ACTIVE
} from "./constants";
import {isValidAuthUser} from "../../utils/auth";

/* -----------------     Initial State     ------------------ */

/**
 * Initial/ Fallback state
 */
const INITIAL_STATE = {
    isAppActive: false,
    authUser: null,
    siteInformation: null
};


/* -----------------     Actions     ------------------ */
/**
 * Action to set {@code isAppActive} in the store based on the specified action
 */
const applySetIsAppActive = (state, action) => ({
    ...state,
    isAppActive: !!action.isAppActive
});

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
    switch (action.type) {
        case ACTION_SET_IS_APP_ACTIVE:
            return applySetIsAppActive(state, action);
        case ACTION_TOGGLE_IS_APP_ACTIVE:
            return applySetIsAppActive(state, {isAppActive: !state.isAppActive});
        case ACTION_SET_AUTH_USER:
            return applySetAuthUser(state, action);
        case ACTION_SET_SITE_INFORMATION:
            return applySetSiteInformation(state, action);
        default:
            return state;
    }
}

export default sessionReducer;
