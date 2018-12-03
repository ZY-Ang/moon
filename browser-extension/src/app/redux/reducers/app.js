/*
 * Copyright (c) 2018 moon
 */

import {
    ACTION_SET_IS_APP_ACTIVE,
    ACTION_TOGGLE_IS_APP_ACTIVE,
    ACTION_SET_UI_BLOCKER_STATE,
    ACTION_SET_APP_MODAL_ERROR_STATE,
    ACTION_SET_APP_MODAL_LOADING_STATE,
    ACTION_SET_APP_MODAL_SUCCESS_STATE,
    ACTION_POP_SCREEN,
    ACTION_PUSH_SCREEN,
    POSSIBLE_SCREENS, SCREEN_UNSUPPORTED, ACTION_SET_SCREEN, SCREEN_MAIN
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
    },
    mainFlowIndex: 0,
    mainFlowTabs: [
        SCREEN_MAIN
    ]
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

/**
 * Action to forcibly set the screen state
 * @warning I hope you know what you're doing
 */
const doSetScreenState = (state, action) => ({
    ...state,
    mainFlowIndex: action.mainFlowIndex || state.mainFlowIndex,
    mainFlowTabs: action.mainFlowTabs || state.mainFlowTabs
});

/**
 * Action to pop the current tab and return to the previous tab
 */
const doPopScreenState = (state) => {
    if (state.mainFlowIndex <= 0) {
        console.warn("There are no more screens to be popped");
        return state;
    } else {
        return {
            ...state,
            mainFlowIndex: state.mainFlowIndex - 1
        };
    }
};

/**
 * Action to push a new screen onto the stack or the unsupported screen if not a known screen
 */
const doPushScreenState = (state, action) => {
    const mainFlowIndex = state.mainFlowIndex + 1;
    if (!action.screen || !POSSIBLE_SCREENS[action.screen]) {
        // Screen invalid or unknown - push an unsupported screen
        return {
            ...state,
            mainFlowIndex,
            mainFlowTabs: [...state.mainFlowTabs.slice(0, mainFlowIndex), SCREEN_UNSUPPORTED]
        };
    } else {
        return {
            ...state,
            mainFlowIndex,
            mainFlowTabs: [...state.mainFlowTabs.slice(0, mainFlowIndex), action.screen]
        };
    }
};

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
        },
        [ACTION_SET_SCREEN](){
            return doSetScreenState(state, action);
        },
        [ACTION_POP_SCREEN](){
            return doPopScreenState(state);
        },
        [ACTION_PUSH_SCREEN](){
            return doPushScreenState(state, action);
        }
    };
    if (!!action.type && !!reducerMap[action.type]) {
        return reducerMap[action.type]();
    } else {
        return state;
    }
}

export default appReducer;
