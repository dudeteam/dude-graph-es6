import EventClass from "event-class-es6";

const _connectionOutputPoint = Symbol("outputPoint");
const _connectionInputPoint = Symbol("inputPoint");

export default class Connection extends EventClass {

    /**
     * Creates a connection between the two specified points
     * @param {Point} outputPoint - specifies the output point
     * @param {Point} inputPoint - specifies the input point
     */
    constructor(outputPoint, inputPoint) {
        super();

        this[_connectionOutputPoint] = outputPoint;
        this[_connectionInputPoint] = inputPoint;
    }

    /**
     * Returns this connection fancy name
     * @returns {string}
     */
    get fancyName() { return this[_connectionOutputPoint].fancyName + " => " + this[_connectionInputPoint].fancyName; }
    /**
     * Returns this connection output point
     * @returns {Point}
     */
    get connectionOutputPoint() { return this[_connectionOutputPoint]; }
    /**
     * Returns this connection input point
     * @returns {Point}
     */
    get connectionInputPoint() { return this[_connectionInputPoint]; }

    /**
     * Returns the corresponding point connected to the specified point
     * @param {Point} point - specifies the point
     * @returns {Point}
     */
    other(point) {
        if (point === this[_connectionOutputPoint]) {
            return this[_connectionInputPoint];
        }
        if (point === this[_connectionInputPoint]) {
            return this[_connectionOutputPoint];
        }
        throw new Error("`" + this.fancyName + "` has no point `" + point.fancyName + "`");
    }

}
