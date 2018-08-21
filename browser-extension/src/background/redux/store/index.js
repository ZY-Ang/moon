/*
 * Copyright (c) 2018 moon
 */
import {createStore} from 'redux';
import rootReducer from '../reducers';

/**
 * The state layer for interacting with the Redux store.
 */
const store = createStore(rootReducer);

export default store;
