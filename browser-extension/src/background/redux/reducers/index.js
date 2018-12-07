/*
 * Copyright (c) 2018 moon
 */
import {combineReducers} from 'redux';
import apiReducer from "./api";
import coinbaseReducer from "./coinbase";

/**
 * The root reducer interface that contains the
 * required reducers to interact with the global state.
 * @type {Reducer<any>}
 */
const rootReducer = combineReducers({
    apiState: apiReducer,
    coinbaseState: coinbaseReducer
});

export default rootReducer;
