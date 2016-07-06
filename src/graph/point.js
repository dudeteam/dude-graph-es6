/*eslint no-unused-vars: "off"*/

import isString from "lodash-es/isString";
import EventClass from "event-class-es6";
import forEachRight from "lodash-es/forEachRight";

import PointPolicy from "./policy";
import defaultValue from "./utils/default";

const _pointOutput = Symbol("pointOutput");
const _pointName = Symbol("pointName");
const _pointTemplate = Symbol("pointTemplate");
const _pointValueType = Symbol("pointValueType");
const _pointValue = Symbol("pointValue");
const _pointPolicy = Symbol("pointPolicy");
const _pointBlock = Symbol("pointBlock");
const _pointConnections = Symbol("pointConnections");

export default class Point extends EventClass {

    /**
     * @param {boolean} pointOutput - whether this point is an output or an input
     * @param {Point.pointDataTypedef} pointData - The point configuration data
     */
    constructor(pointOutput, pointData) {
        super();

        this[_pointOutput] = pointOutput;
        this[_pointName] = defaultValue(pointData.pointName, null);
        this[_pointTemplate] = defaultValue(pointData.pointTemplate, null);
        this[_pointValueType] = defaultValue(pointData.pointValueType, null);
        this[_pointValue] = defaultValue(pointData.pointValue, null);
        this[_pointPolicy] = PointPolicy.NONE;
        this[_pointBlock] = null;
        this[_pointConnections] = [];
        if (typeof pointData.pointPolicy !== "undefined") {
            this[_pointPolicy] = PointPolicy.deserialize(pointData.pointPolicy);
        } else {
            this[_pointPolicy] = PointPolicy.DEFAULT;
        }
        if (!isString(this[_pointName])) {
            throw new Error("`" + this.fancyName + "` must have a non-null `pointName`");
        }
        if (this[_pointTemplate] === null && !isString(this[_pointValueType])) {
            throw new Error("`" + this.fancyName + "` " +
                "`pointValueType` must be a non-null String if no `pointTemplate` is provided");
        }
        if (this.hasPolicy(PointPolicy.SINGLE_CONNECTION) && this.hasPolicy(PointPolicy.MULTIPLE_CONNECTIONS)) {
            throw new Error("`" + this.fancyName + "` `pointPolicy` cannot mix " +
                "`SINGLE_CONNECTION` and `MULTIPLE_CONNECTIONS`");
        }
    }

    /**
     * Returns this point fancy name
     * @returns {string}
     */
    get fancyName() { return this[_pointName]; }
    /**
     * Returns this point type
     * @returns {string}
     */
    get pointType() { return this.constructor.name; }
    /**
     * Returns the name of this point
     * @returns {string}
     */
    get pointName() { return this[_pointName]; }
    /**
     * Returns whether this point is an output or an input
     * @returns {boolean}
     */
    get pointOutput() { return this[_pointOutput]; }
    /**
     * Returns this point template
     * @returns {string|null}
     */
    get pointTemplate() { return this[_pointTemplate]; }
    /**
     * Returns this point value type
     * @returns {string}
     */
    get pointValueType() { return this[_pointValueType]; }
    /**
     * Sets this point value type to the specified value type
     * @param {string} pointValueType - specifies the value type
     */
    set pointValueType(pointValueType) { this.changeValueType(pointValueType); }
    /**
     * Returns this point value
     * @returns {*|null}
     */
    get pointValue() { return this[_pointValue]; }
    /**
     * Sets this point value to the specified value
     * @param {*|null} pointValue - specifies the value
     */
    set pointValue(pointValue) { this.changeValue(pointValue); }
    /**
     * Returns this point policy
     * @returns {number}
     */
    get pointPolicy() { return this[_pointPolicy]; }
    /**
     * Returns this point's block
     * @returns {Block|null}
     */
    get pointBlock() { return this[_pointBlock]; }
    /**
     * Sets this point block to the specified block
     * @param {Block|null} pointBlock - specifies the block
     */
    set pointBlock(pointBlock) { this[_pointBlock] = pointBlock; }
    /**
     * Returns this point connections
     * @returns {Array<Connection>}
     */
    get pointConnections() { return this[_pointConnections]; }

    /**
     * Returns whether this point has the specified policy
     * @param {number} policy - specifies the policy
     * @returns {boolean}
     */
    hasPolicy(policy) { return PointPolicy.has(this[_pointPolicy], policy); }

    /**
     * Changes this point value to the specified value
     * @param {*|null} value - specifies the value
     * @param {boolean} [ignoreEmit=false] - whether to emit events
     */
    changeValue(value, ignoreEmit) {
        if (this[_pointBlock] === null) {
            throw new Error("`" + this.fancyName + "` cannot change value when not bound to a block");
        }
        if (value !== null && !this.emptyConnection()) {
            throw new Error("`" + this.fancyName + "` cannot change value when connected to another point");
        }
        if (value !== null && !this.hasPolicy(PointPolicy.VALUE)) {
            throw new Error("`" + this.fancyName + "` cannot change value when the policy `VALUE` is disabled");
        }
        const oldValue = this[_pointValue];
        const assignValue = this[_pointBlock].blockGraph.convertValue(this[_pointValueType], value);
        if (typeof assignValue === "undefined") {
            throw new Error("`" + this[_pointBlock].blockGraph.fancyName + "` " + value +
                "` is not compatible with type `" + this[_pointValueType] + "`");
        }
        this[_pointValue] = assignValue;
        this[_pointBlock].pointValueChanged(this, assignValue, oldValue);
        if (!ignoreEmit) {
            this.emit("value-change", assignValue, oldValue);
            this[_pointBlock].blockGraph.emit("point-value-change", this, assignValue, oldValue);
        }
    }
    /**
     * Changes this point value type to the specified value type
     * @param {*|null} pointValueType - specifies the value type
     * @param {boolean} [ignoreEmit=false] - whether to emit events
     */
    changeValueType(pointValueType, ignoreEmit) {
        if (this[_pointBlock] === null) {
            throw new Error("`" + this.fancyName + "` cannot change value type when not bound to a block");
        }
        if (this[_pointBlock].blockGraph.valueTypeByName(pointValueType) === null) {
            throw new Error("`" + this[_pointBlock].blockGraph.fancyName + "` has no value type `" + pointValueType + "`");
        }
        if (typeof this[_pointBlock].blockGraph.convertValue(pointValueType, this[_pointValue]) === "undefined") {
            throw new Error("`" + this[_pointValue] + "` is not compatible with value type `" + pointValueType + "`");
        }
        const oldValueType = this[_pointValueType];
        this[_pointValueType] = pointValueType;
        if (!ignoreEmit) {
            this.emit("value-type-change", pointValueType, oldValueType);
            this[_pointBlock].blockGraph.emit("point-value-type-change", this, pointValueType, oldValueType);
        }
        this.changeValue(this[_pointValue], !!ignoreEmit);
    }

    /**
     * Returns whether this point is empty
     * @returns {boolean}
     */
    empty() { return this.emptyValue() && this.emptyConnection(); }
    /**
     * Returns whether this point has a null value
     * @returns {boolean}
     */
    emptyValue() { return this[_pointValue] === null; }
    /**
     * Returns whether this point has no connections
     * @returns {boolean}
     */
    emptyConnection() { return this[_pointConnections].length === 0; }

    /**
     * Connects the specified other point to this point
     * @param {Point} otherPoint - specifies the other point
     * @returns {Connection}
     */
    connect(otherPoint) {
        if (this[_pointBlock] === null) {
            throw new Error("`" + this.fancyName + "`");
        }
        if (this[_pointOutput]) {
            return this[_pointBlock].blockGraph.connect(this, otherPoint);
        }
        return this[_pointBlock].blockGraph.connect(otherPoint, this);
    }
    /**
     * Disconnects the specified other point from this point
     * @param {Point} otherPoint - specifies the other point
     * @returns {Connection}
     */
    disconnect(otherPoint) {
        if (this[_pointBlock] === null) {
            throw new Error("`" + this.fancyName + "`");
        }
        if (this[_pointOutput]) {
            return this[_pointBlock].blockGraph.disconnect(this, otherPoint);
        }
        return this[_pointBlock].blockGraph.disconnect(otherPoint, this);
    }
    /**
     * Disconnects all points from this point
     */
    disconnectAll() {
        forEachRight(this[_pointConnections], (connection) => {
            this.disconnect(connection.other(this));
        });
    }

    /**
     * Called when this point is added to a block
     */
    added() {}
    /**
     * Called when this point is connected to the specified point
     * @param {Point} point - specifies the point
     */
    connected(point) {}
    /**
     * Returns whether this point accepts to connect to the specified point
     * @param {Point} point - specifies the other point
     * @returns {boolean}
     */
    acceptConnect(point) { return this !== point; }
    /**
     * Called when this point is disconnected from the specified point
     * @param {Point} point - specifies the point
     */
    disconnected(point) {}
    /**
     * Called when this point is removed from the block
     */
    removed() {}

}

/**
 * @typedef {Object} Point.pointDataTypedef
 * @property {string} pointName
 * @property {string|null} [pointTemplate=null]
 * @property {string} [pointValueType=null]
 * @property {*|null} [pointValue=null]
 * @property {Array<string>} [pointPolicy=["VALUE", "SINGLE_CONNECTION", "CONVERSION"]]
 */
