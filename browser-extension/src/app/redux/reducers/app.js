/*
 * Copyright (c) 2018 moon
 */

import {
    ACTION_POP_SCREEN,
    ACTION_PUSH_SCREEN,
    ACTION_SET_APP_MODAL_ERROR_STATE,
    ACTION_SET_APP_MODAL_LOADING_STATE,
    ACTION_SET_APP_MODAL_SUCCESS_STATE,
    ACTION_SET_IS_APP_ACTIVE,
    ACTION_SET_SCREEN,
    ACTION_SET_UI_BLOCKER_STATE,
    ACTION_TOGGLE_IS_APP_ACTIVE,
    POSSIBLE_SCREENS,
    SCREEN_MAIN,
    SCREEN_UNSUPPORTED
} from "./constants";
import store from "../store";
import appLogger from "../../utils/AppLogger";

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
    mainFlowScreens: [
        SCREEN_MAIN
    ],
    mainFlowLock: false
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
    mainFlowIndex: (!!action.mainFlowIndex || action.mainFlowIndex === 0) ? action.mainFlowIndex : state.mainFlowIndex,
    mainFlowScreens: action.mainFlowScreens || state.mainFlowScreens,
    mainFlowLock: action.mainFlowLock
});

const MAINFLOW_SWIPER_ANIMATION_TIMEOUT = 300;

/**
 * Action to pop the current tab and return to the previous tab
 */
const doPopScreenState = (state) => {
    if (state.mainFlowLock) {
        appLogger.warn("Main flow is performing work.");
        return state;
    } if (state.mainFlowIndex <= 0) {
        appLogger.warn("There are no more screens to be popped");
        return state;
    } else {
        setTimeout(() => store.dispatch({
            mainFlowScreens: state.mainFlowScreens.slice(0, state.mainFlowIndex),
            type: ACTION_SET_SCREEN,
            mainFlowLock: false
        }), MAINFLOW_SWIPER_ANIMATION_TIMEOUT);
        return {
            ...state,
            mainFlowIndex: state.mainFlowIndex - 1,
            mainFlowLock: true
        };
    }
};

/**
 * Action to push a new screen onto the stack or the unsupported screen if not a known screen
 */
const doPushScreenState = (state, action) => {
    setTimeout(() => store.dispatch({
        type: ACTION_SET_SCREEN,
        mainFlowLock: false
    }), MAINFLOW_SWIPER_ANIMATION_TIMEOUT);
    const mainFlowIndex = state.mainFlowIndex + 1;
    if (state.mainFlowLock) {
        appLogger.warn("Main flow is performing work.");
        return state;
    } if (!action.screen || !POSSIBLE_SCREENS[action.screen]) {
        // Screen invalid or unknown - push an unsupported screen
        return {
            ...state,
            mainFlowIndex,
            mainFlowScreens: [...state.mainFlowScreens, SCREEN_UNSUPPORTED],
            mainFlowLock: true
        };
    } else {
        return {
            ...state,
            mainFlowIndex,
            mainFlowScreens: [...state.mainFlowScreens, action.screen],
            mainFlowLock: true
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
