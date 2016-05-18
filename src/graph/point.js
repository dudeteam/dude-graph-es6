import isString from "lodash-es/isString";
import EventClass from "event-class-es6";
import forEachRight from "lodash-es/forEachRight";

import PointPolicy from "./policy";
import defaultValue from "./utils/default";

let _pointOutput = Symbol("pointOutput");
let _pointName = Symbol("pointName");
let _pointTemplate = Symbol("pointTemplate");
let _pointValueType = Symbol("pointValueType");
let _pointValue = Symbol("pointValue");
let _pointPolicy = Symbol("pointPolicy");
let _pointBlock = Symbol("pointBlock");
let _pointConnections = Symbol("pointConnections");

export default class Point extends EventClass {

    /**
     * @param {boolean} pointOutput - whether this point is an output or an input
     * @param {Point.pointDataTypedef} pointData - The point configuration data
     */
    constructor(pointOutput, pointData) {
        super();

        this[_pointOutput] = pointOutput;
        this[_pointName] = null;
        this[_pointTemplate] = null;
        this[_pointValueType] = null;
        this[_pointValue] = null;
        this[_pointPolicy] = PointPolicy.NONE;
        this[_pointBlock] = null;
        this[_pointConnections] = [];
        this.create(pointData);
    }

    /**
     * Creates the point from the given point data
     * @param {Point.pointDataTypedef} pointData - The point configuration data
     */
    create(pointData) {
        this[_pointName] = defaultValue(pointData.pointName, null);
        this[_pointTemplate] = defaultValue(pointData.pointTemplate, null);
        this[_pointValueType] = defaultValue(pointData.pointValueType, null);
        this[_pointValue] = defaultValue(pointData.pointValue, null);
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
     * Sets this point value type
     * @param {string} pointValueType - the point value type to set
     */
    set pointValueType(pointValueType) { this.changeValueType(pointValueType); }
    /**
     * Returns this point value
     * @returns {*|null}
     */
    get pointValue() { return this[_pointValue]; }
    /**
     * Sets this point value
     * @param {*|null} pointValue - the point value to set
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
     * Sets this point's block
     * @param {Block|null} pointBlock - the block to set
     */
    set pointBlock(pointBlock) { this[_pointBlock] = pointBlock; }
    /**
     * Returns this point connections
     * @returns {Array<Connection>}
     */
    get pointConnections() { return this[_pointConnections]; }

    /**
     * Returns whether this point has the given policy
     * @param {number} policy - the policy to check
     * @returns {boolean}
     */
    hasPolicy(policy) {
        return PointPolicy.has(this[_pointPolicy], policy);
    }

    added() {}
    accept() {}
    removed() {}

    /**
     * @param {*|null} value - TODO document
     * @param {boolean} [ignoreEmit=false] - TODO document
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
        var oldValue = this[_pointValue];
        var assignValue = this[_pointBlock].blockGraph.convertValue(this[_pointValueType], value);
        if (typeof assignValue === "undefined") {
            throw new Error("`" + this[_pointBlock].blockGraph.fancyName + "` " + value +
                "` is not compatible with type `" + this[_pointValueType] + "`");
        }
        this[_pointValue] = assignValue;
        if (!ignoreEmit) {
            this.emit("value-change", assignValue, oldValue);
            this[_pointBlock].blockGraph.emit("point-value-change", this, assignValue, oldValue);
            this[_pointBlock].pointValueChanged(this, assignValue, oldValue);
        }
    }
    /**
     * @param {*|null} pointValueType - TODO document
     * @param {boolean} [ignoreEmit=false] - TODO document
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
        var oldValueType = this[_pointValueType];
        this[_pointValueType] = pointValueType;
        if (!ignoreEmit) {
            this.emit("value-type-change", pointValueType, oldValueType);
            this[_pointBlock].blockGraph.emit("point-value-type-change", this, pointValueType, oldValueType);
        }
        this.changeValue(this[_pointValue], !!ignoreEmit);
    }

    /**
     * Returns whether this point is empty or not
     * @returns {boolean}
     */
    empty() { return this.emptyValue() && this.emptyConnection(); }
    /**
     * Returns true if this point has no value
     * @returns {boolean}
     */
    emptyValue() { return this[_pointValue] === null; }
    /**
     * Returns true if this point no connection
     * @returns {boolean}
     */
    emptyConnection() { return this[_pointConnections].length === 0; }

    /**
     * Connects this point to the given other point
     * @param {Point} otherPoint - the point to connect to
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
     * Disconnects this point from the given other point
     * @param {Point} otherPoint - the point to disconnect from
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
     * Disconnects this points from all other points
     */
    disconnectAll() {
        var point = this;
        forEachRight(this[_pointConnections], (connection) => {
            point.disconnect(connection.other(point));
        });
    }

    connected() {}
    acceptConnect() {
        return true;
    }

}

/**
 * @typedef {Object} Point.pointDataTypedef
 * @property {string} pointName
 * @property {string|null} [pointTemplate=null]
 * @property {string} [pointValueType=null]
 * @property {*|null} [pointValue=null]
 * @property {Array<string>} [pointPolicy=["VALUE", "SINGLE_CONNECTION", "CONVERSION"]]
 */
