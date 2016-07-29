import EventClass from "event-class-es6";

const _inputPoint = Symbol("inputPoint");
const _outputPoint = Symbol("outputPoint");

export default class Connection extends EventClass {

    /**
     * Creates a connection between the two specified points
     * @param {Point} inputPoint - specifies the input point
     * @param {Point} outputPoint - specifies the output point
     */
    constructor(inputPoint, outputPoint) {
        super();

        this[_inputPoint] = inputPoint;
        this[_outputPoint] = outputPoint;
    }

    /**
     * Returns this connection fancy name
     * @returns {string}
     */
    get fancyName() { return this[_outputPoint].fancyName + " => " + this[_inputPoint].fancyName; }
    /**
     * Returns this connection input point
     * @returns {Point}
     */
    get inputPoint() { return this[_inputPoint]; }
    /**
     * Returns this connection output point
     * @returns {Point}
     */
    get outputPoint() { return this[_outputPoint]; }

    /**
     * Returns the corresponding point connected to the specified point
     * @param {Point} point - specifies the point
     * @returns {Point}
     */
    other(point) {
        if (point === this[_inputPoint]) {
            return this[_outputPoint];
        } else if (point === this[_outputPoint]) {
            return this[_inputPoint];
        }
        throw new Error(this.fancyName + " has no point " + point.fancyName);
    }

}
