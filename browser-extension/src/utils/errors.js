/*
 * Copyright (c) 2018 moon
 */

/**
 * Universal utility to handle generic errors
 * @param error {error}
 */
export const handleErrors = (error) => {
    console.error(error);
    if (!!error.response) {
        console.error("Error response: ", error.response);
    }
};
