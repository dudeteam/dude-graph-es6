import EventClass from "event-class-es6";
import defaultValue from "./utils/default";
import block from "./blocks/variable";

const _name = Symbol("name");
const _valueType = Symbol("valueType");
const _value = Symbol("value");
const _block = Symbol("block");
const _graph = Symbol("graph");

export default class Variable extends EventClass {

    /**
     * @param {Variable.variableDataTypedef} variableData - the variable configuration data
     */
    constructor(variableData) {
        super();

        this[_name] = defaultValue(variableData.name);
        this[_valueType] = defaultValue(variableData.valueType);
        this[_value] = defaultValue(variableData.value);
        this[_block] = defaultValue(variableData.block, null);
        this[_graph] = null;
        if (typeof this[_name] !== "string") {
            throw new Error(this.fancyName + " name must be a non-null String");
        }
        if (typeof this[_valueType] !== "string") {
            throw new Error(this.fancyName + " valueType must be a non-null String");
        }
        if (this[_block] !== null && !(this[_block] instanceof block)) {
            throw new Error(this.fancyName + " block must be of type block");
        }
    }

    /**
     * Returns the variable fancy name
     * @returns {string}
     */
    get fancyName() { return this.toString(); }
    /**
     * Returns the variable name
     * @returns {string}
     */
    get name() { return this[_name]; }
    /**
     * Returns the variable value type
     * @returns {string}
     */
    get valueType() { return this[_valueType]; }
    /**
     * Returns the variable value
     * @returns {*|null}
     */
    get value() { return this[_value]; }
    /**
     * Sets this variable value to the specified value
     * @param {*|null} value - specifies the value
     */
    set value(value) { this.changeValue(value); }
    /**
     * Returns this variable block
     * @returns {Block}
     */
    get block() { return this[_block]; }
    /**
     * Sets this variable block to the specified block
     * @param {Block} block - specifies the block
     */
    set block(block) { this[_block] = block; }
    /**
     * Returns this variable graph
     * @returns {Graph}
     */
    get graph() { return this[_graph]; }
    /**
     * Sets this variable graph to the specified graph
     * @param {Graph} graph - specifies the graph
     */
    set graph(graph) { this[_graph] = graph; }

    added() {}
    removed() {}

    /**
     * Changes this variable value to the specified value
     * @param {*|null} value - specifies the value
     * @param {boolean} [ignoreEmit=false] - whether to emit events
     */
    changeValue(value, ignoreEmit) {
        const assignValue = this[_graph].convertValue(this[_valueType], value);
        if (typeof assignValue === "undefined") {
            throw new Error(this.fancyName + " " + value +
                " is not compatible with type " + this[_valueType]);
        }
        const oldValue = this[_value];
        this[_value] = assignValue;
        if (!ignoreEmit) {
            this.emit("value-change", assignValue, oldValue);
            this[_graph].emit("variable-value-change", this, assignValue, oldValue);
        }
    }

}

/**
 * @typedef {Object} Variable.variableDataTypedef
 * @property {string} name
 * @property {string} valueType
 * @property {*|null} [value=null]
 * @property {Block} [block=null]
 */
