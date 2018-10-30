/*
 * Copyright (c) 2018 moon
 */
import {combineReducers} from 'redux';
import appReducer from "./app";
import sessionReducer from "./session";

/**
 * The root reducer interface that contains the
 * required reducers to interact with the global state.
 * @type {Reducer<any>}
 */
const rootReducer = combineReducers({
    appState: appReducer,
    sessionState: sessionReducer
});

export default rootReducer;
