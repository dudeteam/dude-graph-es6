import EventClass from "event-class-es6";

import PointPolicy from "./policy";
import defaultValue from "./utils/default";

const _name = Symbol("name");
const _input = Symbol("input");
const _template = Symbol("template");
const _valueType = Symbol("valueType");
const _value = Symbol("value");
const _policy = Symbol("policy");
const _block = Symbol("block");
const _connections = Symbol("connections");

export default class Point extends EventClass {

    /**
     * @param {boolean} input - whether this point is an input or an output
     * @param {Point.pointDataTypedef} pointData - The point configuration data
     */
    constructor(input, pointData) {
        super();

        this[_name] = defaultValue(pointData.name, null);
        this[_input] = input;
        this[_template] = defaultValue(pointData.template, null);
        this[_valueType] = defaultValue(pointData.valueType, null);
        this[_value] = defaultValue(pointData.value, null);
        this[_policy] = PointPolicy.NONE;
        this[_block] = null;
        this[_connections] = [];
        if (typeof pointData.policy !== "undefined") {
            this[_policy] = PointPolicy.deserialize(pointData.policy);
        } else {
            this[_policy] = PointPolicy.DEFAULT;
        }
        if (typeof this[_name] !== "string") {
            throw new Error(this.fancyName + " must have a non-null name");
        }
        if (this[_template] === null && typeof this[_valueType] !== "string") {
            throw new Error(this.fancyName + " " +
                "valueType must be a non-null String if no template is provided");
        }
        if (this.hasPolicy(PointPolicy.SINGLE_CONNECTION) && this.hasPolicy(PointPolicy.MULTIPLE_CONNECTIONS)) {
            throw new Error(this.fancyName + " policy cannot mix " +
                "SINGLE_CONNECTION and MULTIPLE_CONNECTIONS");
        }
    }

    /**
     * Returns this point fancy name
     * @returns {string}
     */
    get fancyName() { return this[_name]; }
    /**
     * Returns this point type
     * @returns {string}
     */
    get type() { return this.constructor.name; }
    /**
     * Returns the name of this point
     * @returns {string}
     */
    get name() { return this[_name]; }
    /**
     * Returns whether this point is an input
     * @returns {boolean}
     */
    get input() { return this[_input]; }
    /**
     * Returns whether this point is an output
     * @returns {boolean}
     */
    get output() { return !this[_input]; }
    /**
     * Returns this point template
     * @returns {string|null}
     */
    get template() { return this[_template]; }
    /**
     * Returns this point value type
     * @returns {string}
     */
    get valueType() { return this[_valueType]; }
    /**
     * Sets this point value type to the specified value type
     * @param {string} valueType - specifies the value type
     */
    set valueType(valueType) { this.changeValueType(valueType); }
    /**
     * Returns this point value
     * @returns {*|null}
     */
    get value() { return this[_value]; }
    /**
     * Sets this point value to the specified value
     * @param {*|null} value - specifies the value
     */
    set value(value) { this.changeValue(value); }
    /**
     * Returns this point policy
     * @returns {number}
     */
    get policy() { return this[_policy]; }
    /**
     * Returns this point's block
     * @returns {Block|null}
     */
    get block() { return this[_block]; }
    /**
     * Sets this point block to the specified block
     * @param {Block|null} block - specifies the block
     */
    set block(block) { this[_block] = block; }
    /**
     * Returns this point connections
     * @returns {Array<Connection>}
     */
    get connections() { return this[_connections]; }
    /**
     * Returns this point position in block
     * @returns {number}
     */
    get position() {
        if (this[_block] === null) {
            throw new Error(this.fancyName + " cannot get position when not bound to a block");
        }
        return this[_input] ? this[_block].inputs.indexOf(this) : this[_block].outputs.indexOf(this);
    }

    /**
     * Returns whether this point has the specified policy
     * @param {number} policy - specifies the policy
     * @returns {boolean}
     */
    hasPolicy(policy) { return PointPolicy.has(this.policy, policy); }

    /**
     * Changes this point value to the specified value
     * @param {*|null} value - specifies the value
     * @param {boolean} ignoreEmit - whether to emit events
     */
    changeValue(value, ignoreEmit = false) {
        if (this.block === null) {
            throw new Error(this.fancyName + " cannot change value when not bound to a block");
        }
        if (value !== null && !this.emptyConnection()) {
            throw new Error(this.fancyName + " cannot change value when connected to another point");
        }
        if (value !== null && !this.hasPolicy(PointPolicy.VALUE)) {
            throw new Error(this.fancyName + " cannot change value when the policy VALUE is disabled");
        }
        const oldValue = this.value;
        const assignValue = this.block.graph.convertValue(this.valueType, value);
        if (typeof assignValue === "undefined") {
            throw new Error(this.block.graph.fancyName + " " + value +
                " is not compatible with type " + this.valueType);
        }
        this[_value] = assignValue;
        this.block.pointValueChanged(this, assignValue, oldValue);
        if (!ignoreEmit) {
            this.emit("value-change", assignValue, oldValue);
            this.block.emit("point-value-change", this, assignValue, oldValue);
            this.block.graph.emit("point-value-change", this, assignValue, oldValue);
        }
    }
    /**
     * Changes this point value type to the specified value type
     * @param {*|null} valueType - specifies the value type
     * @param {boolean} ignoreEmit - whether to emit events
     */
    changeValueType(valueType, ignoreEmit = false) {
        if (this.block === null) {
            throw new Error(this.fancyName + " cannot change value type when not bound to a block");
        }
        if (this.block.graph.valueTypeByName(valueType) === null) {
            throw new Error(this.block.graph.fancyName + " has no value type " + valueType);
        }
        if (typeof this.block.graph.convertValue(valueType, this.value) === "undefined") {
            throw new Error(this.value + " is not compatible with value type " + valueType);
        }
        const oldValueType = this.valueType;
        this[_valueType] = valueType;
        if (valueType !== oldValueType) {
            this.block.pointValueTypeChanged(this, valueType, oldValueType);
            if (!ignoreEmit) {
                this.emit("value-type-change", valueType, oldValueType);
                this.block.emit("point-value-type-change", this, valueType, oldValueType);
                this.block.graph.emit("point-value-type-change", this, valueType, oldValueType);
            }
        }
        this.changeValue(this.value, ignoreEmit);
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
    emptyValue() { return this.value === null; }
    /**
     * Returns whether this point has no connections
     * @returns {boolean}
     */
    emptyConnection() { return this.connections.length === 0; }

    /**
     * Connects the specified other point to this point
     * @param {Point} otherPoint - specifies the other point
     * @returns {Connection}
     */
    connect(otherPoint) {
        if (this.block === null) {
            throw new Error(this.fancyName + " cannot connect when not bound to a block");
        }
        if (this.input) {
            return this.block.graph.connect(this, otherPoint);
        }
        return this.block.graph.connect(otherPoint, this);
    }
    /**
     * Disconnects the specified other point from this point
     * @param {Point} otherPoint - specifies the other point
     * @returns {Connection}
     */
    disconnect(otherPoint) {
        if (this.block === null) {
            throw new Error(this.fancyName + " cannot disconnect when not bound to a block");
        }
        if (this.input) {
            return this.block.graph.disconnect(this, otherPoint);
        }
        return this.block.graph.disconnect(otherPoint, this);
    }
    /**
     * Disconnects all points from this point
     */
    disconnectAll() {
        for (let i = this.connections.length - 1; i >= 0; i--) {
            this.disconnect(this.connections[i].other(this));
        }
    }

    /*eslint-disable no-unused-vars */
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
    /*eslint-enable no-unused-vars */

}

/**
 * @typedef {Object} Point.pointDataTypedef
 * @property {string} name
 * @property {string|null} [template=null]
 * @property {string|null} [valueType=null]
 * @property {*|null} [value=null]
 * @property {Array<string>} [policy=["VALUE", "SINGLE_CONNECTION", "CONVERSION"]]
 */
