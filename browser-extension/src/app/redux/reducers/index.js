/*
 * Copyright (c) 2018 moon
 */
import {combineReducers} from 'redux';
import sessionReducer from "./session";

/**
 * The root reducer interface that contains the
 * required reducers to interact with the global state.
 * @type {Reducer<any>}
 */
const rootReducer = combineReducers({
    sessionState: sessionReducer
});

export default rootReducer;
