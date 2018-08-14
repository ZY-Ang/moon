/*
 * Copyright (c) 2018 moon
 */

import AWS from "./config/aws/AWS";
import S3 from "./services/aws/S3";

/**
 * A test function to be used for prototyping new APIs.
 * This will be automatically tree-shaken out in production.
 */
const moonTestFunction = (params) => {
    console.log("moonTestFunction");
    // const userSub = decode(AuthUser.getInstance().getIdToken().getJwtToken()).sub;
    const userSub = AWS.config.credentials.identityId;

    return S3.upload('moon-user-info', userSub, params)
        .promise()
        .then(stuff => console.log("YAS!!!. Stuff: ", stuff));
};

export default moonTestFunction;
