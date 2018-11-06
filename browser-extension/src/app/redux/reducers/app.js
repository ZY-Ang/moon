/*
 * Copyright (c) 2018 moon
 */

import {
    ACTION_SET_IS_APP_ACTIVE,
    ACTION_TOGGLE_IS_APP_ACTIVE,
    ACTION_SET_UI_BLOCKER_STATE,
    ACTION_SET_APP_MODAL_ERROR_STATE,
    ACTION_SET_APP_MODAL_LOADING_STATE, ACTION_SET_APP_MODAL_SUCCESS_STATE
} from "./constants";

/* -----------------     Initial State     ------------------ */

/**
 * Initial/ Fallback state
 */
const INITIAL_STATE = {
    isAppActive: false,
    appModalLoadingState: {
        isActive: false,
        text: ""
    },
    appModalErrorState: {
        isActive: false,
        text: ""
    },
    appModalSuccessState: {
        isActive: false,
        text: ""
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
 * Action to set {@code appModalLoadingState} in the store based on the specified action
 */
const applySetAppModalLoadingState = (state, action) => ({
    ...state,
    appModalLoadingState: {
        isActive: action.isActive,
        text: action.text
    }
});

/**
 * Action to set {@code appModalSuccessState} in the store based on the specified action
 */
const applySetAppModalSuccessState = (state, action) => ({
    ...state,
    appModalSuccessState: {
        isActive: action.isActive,
        text: action.text
    }
});

/**
 * Action to set {@code appModalErrorState} in the store based on the specified action
 */
const applySetAppModalErrorState = (state, action) => ({
    ...state,
    appModalErrorState: {
        isActive: action.isActive,
        text: action.text
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
        [ACTION_SET_APP_MODAL_LOADING_STATE](){
            return applySetAppModalLoadingState(state, action);
        },
        [ACTION_SET_APP_MODAL_SUCCESS_STATE](){
            return applySetAppModalSuccessState(state, action);
        },
        [ACTION_SET_APP_MODAL_ERROR_STATE](){
            return applySetAppModalErrorState(state, action);
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
