import EventClass from "event-class-es6";
import defaultValue from "./utils/default";
import VariableBlock from "./blocks/variable";

const _variableName = Symbol("variableName");
const _variableValueType = Symbol("variableValueType");
const _variableValue = Symbol("variableValue");
const _variableBlock = Symbol("variableBlock");
const _variableGraph = Symbol("variableGraph");

export default class Variable extends EventClass {

    /**
     * @param {Variable.variableDataTypedef} variableData - the variable configuration data
     */
    constructor(variableData) {
        super();

        this[_variableName] = defaultValue(variableData.variableName);
        this[_variableValueType] = defaultValue(variableData.variableValueType);
        this[_variableValue] = defaultValue(variableData.variableValue);
        this[_variableBlock] = defaultValue(variableData.variableBlock, null);
        this[_variableGraph] = null;
        if (typeof this[_variableName] !== "string") {
            throw new Error("`" + this.fancyName + "` `variableName` must be a non-null String");
        }
        if (typeof this[_variableValueType] !== "string") {
            throw new Error("`" + this.fancyName + "` `_variableValueType` must be a non-null String");
        }
        if (this[_variableBlock] !== null && !(this[_variableBlock] instanceof VariableBlock)) {
            throw new Error("`" + this.fancyName + "` `variableBlock` must be of type `VariableBlock`");
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
    get variableName() { return this[_variableName]; }
    /**
     * Returns the variable value type
     * @returns {string}
     */
    get variableValueType() { return this[_variableValueType]; }
    /**
     * Returns the variable value
     * @returns {*|null}
     */
    get variableValue() { return this[_variableValue]; }
    /**
     * Sets this variable value to the specified value
     * @param {*|null} variableValue - specifies the value
     */
    set variableValue(variableValue) { this.changeVariableValue(variableValue); }
    /**
     * Returns this variable block
     * @returns {Block}
     */
    get variableBlock() { return this[_variableBlock]; }
    /**
     * Sets this variable block to the specified block
     * @param {Block} variableBlock - specifies the block
     */
    set variableBlock(variableBlock) { this[_variableBlock] = variableBlock; }
    /**
     * Returns this variable graph
     * @returns {Graph}
     */
    get variableGraph() { return this[_variableGraph]; }
    /**
     * Sets this variable graph to the specified graph
     * @param {Graph} variableGraph - specifies the graph
     */
    set variableGraph(variableGraph) { this[_variableGraph] = variableGraph; }

    added() {}
    removed() {}

    /**
     * Changes this variable value to the specified value
     * @param {*|null} value - specifies the value
     * @param {boolean} [ignoreEmit=false] - whether to emit events
     */
    changeVariableValue(value, ignoreEmit) {
        const assignValue = this[_variableGraph].convertValue(this[_variableValueType], value);
        if (typeof assignValue === "undefined") {
            throw new Error("`" + this.fancyName + "` " + value +
                "` is not compatible with type `" + this[_variableValueType] + "`");
        }
        const oldValue = this[_variableValue];
        this[_variableValue] = assignValue;
        if (!ignoreEmit) {
            this.emit("value-change", assignValue, oldValue);
            this[_variableGraph].emit("variable-value-change", this, assignValue, oldValue);
        }
    }

}

/**
 * @typedef {Object} Variable.variableDataTypedef
 * @property {string} variableName
 * @property {string} variableValueType
 * @property {*|null} [variableValue=null]
 * @property {Block} [variableBlock=null]
 */
