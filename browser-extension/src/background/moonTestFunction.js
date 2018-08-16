/*
 * Copyright (c) 2018 moon
 */

import S3 from "./services/aws/S3";
import AuthUser from "./auth/AuthUser";

/**
 * A test function to be used for prototyping new APIs.
 * This will be automatically tree-shaken out in production.
 */
const moonTestFunction = (params) => {
    console.log("moonTestFunction");
    const userSub = AuthUser.getInstance().getIdToken().getSub();

    return S3.upload('moon-user-info', userSub, params)
        .promise()
        .then(stuff => console.log("YAS!!!. Stuff: ", stuff));
};

export default moonTestFunction;
