/*
 * Copyright (c) 2018 moon
 */

import {
    ACTION_SET_IS_APP_ACTIVE,
    ACTION_TOGGLE_IS_APP_ACTIVE,
    ACTION_SET_APP_MODAL_STATE, ACTION_SET_UI_BLOCKER_STATE
} from "./constants";

/* -----------------     Initial State     ------------------ */

/**
 * Initial/ Fallback state
 */
const INITIAL_STATE = {
    isAppActive: false,
    appModalState: {
        isActive: false,
        state: "loading",
        loadingText: "",
        errorText: "",
        successText: ""
    },
    uiBlockerState: {
        isActive: false,
        title: "",
        subTitle: ""
    }
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
 * Action to set {@code appModalState} in the store based on the specified action
 */
const applySetAppModalState = (state, action) => ({
    ...state,
    appModalState: {
        // Resets all state to initial on any reducer call if not explicitly specified, but retain truth if state is specified
        isActive: !!action.isActive || !!action.state,
        state: action.state || INITIAL_STATE.appModalState.state,
        loadingText: action.loadingText || state.appModalState.loadingText,
        errorText: action.errorText || state.appModalState.errorText,
        successText: action.successText || state.appModalState.successText
    }
});

/**
 * Action to set the {@code uiBlockerState} in the store based on the specified action
 */
const applySetUIBlockerState = (state, action) => ({
    ...state,
    uiBlockerState: {
        isActive: !!action.isActive,
        title: action.title || INITIAL_STATE.uiBlockerState.title,
        subTitle: action.subTitle || INITIAL_STATE.uiBlockerState.subTitle
    }
});

/* -----------------     Session Reducer     ------------------ */
/**
 * Session Reducer that manages all actions related to the store
 */
function appReducer(state = INITIAL_STATE, action) {
    const reducerMap = {
        [ACTION_SET_IS_APP_ACTIVE](){
            return applySetIsAppActive(state, action);
        },
        [ACTION_SET_APP_MODAL_STATE](){
            return applySetAppModalState(state, action);
        },
        [ACTION_TOGGLE_IS_APP_ACTIVE](){
            return applySetIsAppActive(state, {isAppActive: !state.isAppActive});
        },
        [ACTION_SET_UI_BLOCKER_STATE](){
            return applySetUIBlockerState(state, action);
        }
    };
    if (!!action.type && !!reducerMap[action.type]) {
        return reducerMap[action.type]();
    } else {
        return state;
    }
}

export default appReducer;
