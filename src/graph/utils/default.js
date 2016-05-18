/**
 * Returns the given value or the given defaultValue if value is undefined
 * @param {*|undefined} value - the value returned if not undefined
 * @param {*} [defaultValue=value] - the value returned if value is undefined
 * @returns {*}
 */
let defaultValue = (value, defaultValue) => {
    if (typeof value === "undefined") {
        return defaultValue;
    }
    return value;
};

export default defaultValue;
