/**
 * Used in conjunction with
 * {@code JSON.stringify(err, replaceErrors)}
 * to stringify and serialize an error correctly
 */
export const replaceErrors = (key, value) => {
    if (value instanceof Error) {
        let error = {};

        Object.getOwnPropertyNames(value).forEach((key) => {
            error[key] = value[key];
        });

        return error;
    }

    return value;
};
