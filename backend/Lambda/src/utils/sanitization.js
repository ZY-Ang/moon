/**
 * Keys that should not be logged under any circumstances, to any publicly-available database
 * @type {obj}
 */
const RESTRICTED_KEYS = {
    apiKey: true,
    apiSecret: true,
    caFile: true,
    key: true,
    secret: true,
    passphrase: true
};

/**
 * Recursively iterates through a javascript
 * {@param obj} and removes user's secrets from
 * it so we can safely log and store them.
 */
export const removeSecrets = (obj) => {
    obj = JSON.parse(JSON.stringify(obj));
    for (let key in obj) {
        try {
            if (!obj.hasOwnProperty(key)) {
                // Continue
            } else if (!!RESTRICTED_KEYS[key]) {
                delete obj[key];
            } else if (
                !!obj[key] &&
                (
                    obj[key].constructor === Array ||
                    obj[key].constructor === Object
                )
            ) {
                obj[key] = removeSecrets(obj[key]);
            }
        } catch (e) {
            // Continue
            console.error(e);
        }
    }
    return obj;
};