import isString from "lodash-es/isString";
import EventClass from "event-class-es6";
import defaultValue from "./utils/default";
import VariableBlock from "./blocks/variable";

let _variableName = Symbol("variableName");
let _variableValueType = Symbol("variableValueType");
let _variableValue = Symbol("variableValue");
let _variableBlock = Symbol("variableBlock");
let _variableGraph = Symbol("variableGraph");

export default class Variable extends EventClass {

    /**
     * @param {Variable.variableDataTypedef} variableData - the variable configuration data
     */
    constructor(variableData) {
        super();

        this[_variableName] = null;
        this[_variableValueType] = null;
        this[_variableValue] = null;
        this[_variableBlock] = null;
        this[_variableGraph] = null;
        this.create(variableData);
    }

    /**
     * Creates the variable from the given variable data
     * @param {Variable.variableDataTypedef} variableData - the variable configuration data
     */
    create(variableData) {
        this[_variableName] = defaultValue(variableData.variableName);
        this[_variableValueType] = defaultValue(variableData.variableValueType);
        this[_variableValue] = defaultValue(variableData.variableValue);
        this[_variableBlock] = defaultValue(variableData.variableBlock, null);
        if (!isString(this[_variableName])) {
            throw new Error("`" + this.fancyName + "` `variableName` must be a non-null String");
        }
        if (!isString(this[_variableValueType])) {
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
     * @returns {string}
     */
    get variableName() { return this[_variableName]; }
    /**
     * @returns {string}
     */
    get variableValueType() { return this[_variableValueType]; }
    /**
     * @returns {*|null}
     */
    get variableValue() { return this[_variableValue]; }
    /**
     * Sets this variable value
     * @param {*|null} variableValue - the variable value to set
     */
    set variableValue(variableValue) { this.changeVariableValue(variableValue); }
    /**
     * @returns {Block}
     */
    get variableBlock() { return this[_variableBlock]; }
    /**
     * @param {Block} variableBlock - TODO document
     */
    set variableBlock(variableBlock) { this[_variableBlock] = variableBlock; }
    /**
     * @returns {Graph}
     */
    get variableGraph() { return this[_variableGraph]; }
    /**
     * @param {Graph} variableGraph - TODO document
     */
    set variableGraph(variableGraph) { this[_variableGraph] = variableGraph; }

    added() {}
    removed() {}

    /**
     * Changes the variable value
     * @param {Object|null} value - TODO document
     * @param {boolean} [ignoreEmit=false] - TODO document
     */
    changeVariableValue(value, ignoreEmit) {
        var assignValue = this[_variableGraph].convertValue(this[_variableValueType], value);
        if (typeof assignValue === "undefined") {
            throw new Error("`" + this.fancyName + "` " + value +
                "` is not compatible with type `" + this[_variableValueType] + "`");
        }
        var oldValue = this[_variableValue];
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
