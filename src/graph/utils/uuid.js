/**
 * Generates a random bit of an UUID
 * @returns {string}
 */
const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);

/**
 * Generates an UUID
 * @returns {string}
 */
export default () => s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
