/*
 * Copyright (c) 2018 moon
 */

/* -----------------    Cache Action Identifiers     ------------------ */

/** Used to set the current user cache */
export const ACTION_SET_USER_CACHE = 'CACHE_USER_SET';
/** Used to set the current user cache */
export const ACTION_SET_EXCHANGE_RATES_CACHE = 'CACHE_EXCHANGE_RATES_SET';

/* -----------------     Initial State     ------------------ */

/**
 * Initial/ Fallback state
 */
const INITIAL_STATE = {
    user: null,
    exchangeRates: {}
};

/* -----------------     Actions     ------------------ */

/**
 * Action to set the {@code user} in the store based on the specified action
 */
const applySetUser = (state, action) => ({
    ...state,
    user: action.user
});

/**
 * Action to set the {@code exchangeRates} in the store based on the specified action
 */
const applyUpdateExchangeRate = (state, action) => {
    if (!action.exchangeRate) {
        return state;
    } else {
        return {
            ...state,
            exchangeRates: {
                ...state.exchangeRates,
                ...action.exchangeRate
            }
        };
    }
};

/**
 * Reducer that manages all actions related to the store
 */
function apiReducer(state = INITIAL_STATE, action) {
    const reducerMap = {
        [ACTION_SET_USER_CACHE](){
            return applySetUser(state, action);
        },
        [ACTION_SET_EXCHANGE_RATES_CACHE](){
            return applyUpdateExchangeRate(state, action)
        }
    };
    if (!!action.type && !!reducerMap[action.type]) {
        return reducerMap[action.type]();
    } else {
        return state;
    }
}

export default apiReducer;
