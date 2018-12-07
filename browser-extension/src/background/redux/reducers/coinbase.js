/*
 * Copyright (c) 2018 moon
 */

/* -----------------    Coinbase Action Identifiers     ------------------ */

/** Used to set the coinbase auth flow state */
export const ACTION_SET_COINBASE_AUTH_FLOW = 'COINBASE_AUTH_FLOW_SET';

/* -----------------     Initial State     ------------------ */

/**
 * Initial/ Fallback state
 */
const INITIAL_STATE = {
    isCoinbaseAuthFlow: false
};

/* -----------------     Actions     ------------------ */

/**
 * Switch on the coinbase auth flow
 */
const applySetCoinbaseAuthFlowOn = (state, action) => ({
    ...state,
    isCoinbaseAuthFlow: action.isCoinbaseAuthFlow
});

/**
 * Session Reducer that manages all actions related to the store
 */
function coinbaseReducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case ACTION_SET_COINBASE_AUTH_FLOW:
            return applySetCoinbaseAuthFlowOn(state, action);
        default:
            return state;
    }
}

export default coinbaseReducer;