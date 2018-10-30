/*
 * Copyright (c) 2018 moon
 */

import {
    ACTION_SET_IS_APP_ACTIVE,
    ACTION_TOGGLE_IS_APP_ACTIVE, ACTION_SET_IS_UI_BLOCKER_ACTIVE, ACTION_TOGGLE_IS_UI_BLOCKER_ACTIVE
} from "./constants";

/* -----------------     Initial State     ------------------ */

/**
 * Initial/ Fallback state
 */
const INITIAL_STATE = {
    isAppActive: false,
    isUIBlockerActive: false,
    UIBlockerTitleText: "",
    UIBlockerParagraphText: "",
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
 * Action to set the {@code siteInformation} in the store based on the specified action
 */
const applySetIsUIBlockerActive = (state, action) => ({
    ...state,
    isUIBlockerActive: !!action.isUIBlockerActive
});

/* -----------------     Session Reducer     ------------------ */
/**
 * Session Reducer that manages all actions related to the store
 */
function appReducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case ACTION_SET_IS_APP_ACTIVE:
            return applySetIsAppActive(state, action);
        case ACTION_TOGGLE_IS_APP_ACTIVE:
            return applySetIsAppActive(state, {isAppActive: !state.isAppActive});
        case ACTION_SET_IS_UI_BLOCKER_ACTIVE:
            return applySetIsUIBlockerActive(state, action);
        case ACTION_TOGGLE_IS_UI_BLOCKER_ACTIVE:
            return applySetIsUIBlockerActive(state, {isUIBlockerActive: !state.isUIBlockerActive});
        default:
            return state;
    }
}

export default appReducer;
