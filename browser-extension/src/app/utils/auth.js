/*
 * Copyright (c) 2018 moon
 */

import store from "../redux/store";
import {ACTION_SET_AUTH_USER} from "../redux/reducers/constants";

/**
 * @return {boolean} {@code true} if {@param authUser} is valid
 */
export const isValidAuthUser = (authUser) => (
    !!authUser &&
    authUser.constructor === Object &&
    Object.keys(authUser).length !== 0
);

/**
 * Updates the global {@param authUser} for the app
 */
export const updateAuthUser = async (authUser) => {
    return store.dispatch({
        type: ACTION_SET_AUTH_USER,
        authUser
    });
};
