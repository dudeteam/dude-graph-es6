/**
 * Generates a random bit of an UUID
 * @returns {string}
 */
let s4 = function () {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
};

/**
 * Generates an UUID
 * @returns {string}
 */
export default () => {
    return s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
};
