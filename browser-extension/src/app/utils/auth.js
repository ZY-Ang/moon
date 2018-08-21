/*
 * Copyright (c) 2018 moon
 */

/**
 * @return {boolean} {@code true} if {@param authUser} is valid
 */
export const isValidAuthUser = (authUser) =>
    (!!authUser && authUser.constructor === Object && Object.keys(authUser).length !== 0); // TODO: More checks
