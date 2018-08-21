/*
 * Copyright (c) 2018 moon
 */
import {combineReducers} from 'redux';
import coinbaseReducer from "./coinbase";

/**
 * The root reducer interface that contains the
 * required reducers to interact with the global state.
 * @type {Reducer<any>}
 */
const rootReducer = combineReducers({
    coinbaseState: coinbaseReducer
});

export default rootReducer;
