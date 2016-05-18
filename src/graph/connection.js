import EventClass from "event-class-es6";

let _connectionOutputPoint = Symbol("outputPoint");
let _connectionInputPoint = Symbol("inputPoint");

export default class Connection extends EventClass {

    /**
     * Creates a connection between the two given points
     * @param {Point} outputPoint - the output point
     * @param {Point} inputPoint - the input point
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
    get fancyName() { return this[_connectionOutputPoint].fancyName + " => " + this[_connectionInputPoint].fancyName }
    /**
     * @returns {Point}
     */
    get connectionOutputPoint() { return this[_connectionOutputPoint]; }
    /**
     * @returns {Point}
     */
    get connectionInputPoint() { return this[_connectionInputPoint]; }

    /**
     * Returns the point connected to the given point in this connection
     * @param {Point} point - the point connected
     * @returns {Point}
     */
    other(point) {
        if (point === this[_connectionOutputPoint]) {
            return this[_connectionInputPoint];
        }
        if (point === this[_connectionInputPoint]) {
            return this[_connectionOutputPoint];
        }
        throw new Error(this.fancyName);
    }

}
