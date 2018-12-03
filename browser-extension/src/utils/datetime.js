/**
 * @param hoursOffset - delay from now in hours
 * @return {Date}
 */
export const getDelayedHours = (hoursOffset = 0) => {
    const dateObj = new Date();
    dateObj.setHours(dateObj.getHours() + hoursOffset);
    return dateObj;
};

/**
 * @param minutesOffset - delay from now in minutes
 * @return {Date}
 */
export const getDelayedMinutes = (minutesOffset = 0) => {
    const dateObj = new Date();
    dateObj.setMinutes(dateObj.getMinutes() + minutesOffset);
    return dateObj;
};

/**
 * @param secondsOffset - delay from now in seconds
 * @return {Date}
 */
export const getDelayedSeconds = (secondsOffset = 0) => {
    const dateObj = new Date();
    dateObj.setSeconds(dateObj.getSeconds() + secondsOffset);
    return dateObj;
};
