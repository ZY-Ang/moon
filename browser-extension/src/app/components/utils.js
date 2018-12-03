/**
 * To be used together with {@code setState()}
 * to allow for allocation of a dynamic key to
 * value from the input to the local state object.
 */
export const byPropKey = (propertyName, value) => () => ({
    [propertyName]: value
});
