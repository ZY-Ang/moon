/**
 * @param hoursOffset - delay from now in hours
 * @return {Date}
 */
export const getDelayedDate = (hoursOffset = 0) => {
    const dateObj = new Date();
    dateObj.setHours(dateObj.getHours() + hoursOffset);
    return dateObj;
};
