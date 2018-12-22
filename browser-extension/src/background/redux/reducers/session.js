/*
 * Copyright (c) 2018 moon
 */


/* -----------------    Session Action Identifiers     ------------------ */

/** Used to set the auth0 CSRF state */
export const ACTION_SET_CSRF_STATE = 'CSRF_STATE_SET';

/* -----------------     Initial State     ------------------ */

/**
 * Initial/ Fallback state
 */
const INITIAL_STATE = {
    csrfState: null
};

/* -----------------     Actions     ------------------ */

/**
 * Action to set the {@code csrfState} in the store based on the specified action
 */
const applySetCsrfState = (state, action) => ({
    ...state,
    csrfState: action.csrfState
});

/**
 * Reducer that manages all actions related to the store
 */
function sessionReducer(state = INITIAL_STATE, action) {
    const reducerMap = {
        [ACTION_SET_CSRF_STATE](){
            return applySetCsrfState(state, action);
        }
    };
    if (!!action.type && !!reducerMap[action.type]) {
        return reducerMap[action.type]();
    } else {
        return state;
    }
}

export default sessionReducer;
