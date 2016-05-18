import pull from "lodash-es/pull";
import find from "lodash-es/find";
import filter from "lodash-es/filter";
import forOwn from "lodash-es/forOwn";
import isArray from "lodash-es/isArray";
import includes from "lodash-es/includes";
import toNumber from "lodash-es/toNumber";
import toString from "lodash-es/toString";
import isString from "lodash-es/isString";
import isNumber from "lodash-es/isNumber";
import isObject from "lodash-es/isObject";
import isBoolean from "lodash-es/isBoolean";
import EventClass from "event-class-es6";

import Connection from "./connection";
import PointPolicy from "./policy";

let _graphValueTypes = Symbol("graphValueTypes");
let _graphModels = Symbol("graphModels");
let _graphBlocks = Symbol("graphBlocks");
let _graphBlockIds = Symbol("graphBlockIds");
let _graphVariables = Symbol("graphVariables");
let _graphConnections = Symbol("graphConnections");
let _graphErrno = Symbol("graphErrno");

export default class Graph extends EventClass {

    constructor() {
        super();

        this[_graphBlocks] = [];
        this[_graphBlockIds] = {};
        this[_graphVariables] = [];
        this[_graphConnections] = [];
        this[_graphValueTypes] = {
            "Stream": {
                "convert": () => undefined,
                "typeCompatibles": []
            },
            "String": {
                "typeConvert": (value) => {
                    if (isString(value)) {
                        return value;
                    }
                    if (isNumber(value) || isBoolean(value)) {
                        return toString(value);
                    }
                    return undefined;
                },
                "typeCompatibles": ["Text", "Number", "Boolean"]
            },
            "Text": {
                "typeConvert": (value) => {
                    if (isString(value)) {
                        return value;
                    }
                    if (isNumber(value) || isBoolean(value)) {
                        return toString(value);
                    }
                    return undefined;
                },
                "typeCompatibles": ["String", "Number", "Boolean"]
            },
            "Number": {
                "typeConvert": (value) => {
                    if (isNumber(value)) {
                        return value;
                    }
                    if (/^[-+]?[0-9]+(\.[0-9]+)?$/.test(value)) {
                        return toNumber(value);
                    }
                    if (value === "true" || value === true) {
                        return 1;
                    }
                    if (value === "false" || value === false) {
                        return 0;
                    }
                    return undefined;
                },
                "typeCompatibles": ["Boolean"]
            },
            "Boolean": {
                "typeConvert": (value) => {
                    if (isBoolean(value)) {
                        return value;
                    }
                    if (value === 1 || value === "true") {
                        return true;
                    }
                    if (value === 0 || value === "false") {
                        return false;
                    }
                    return undefined;
                },
                "typeCompatibles": ["Number"]
            },
            "Object": {
                "typeConvert": (value) => {
                    if (isObject(value)) {
                        return value;
                    }
                    return undefined;
                },
                "typeCompatibles": []
            },
            "Array": {
                "typeConvert": (value) => {
                    if (isArray(value)) {
                        return value;
                    }
                    return undefined;
                },
                "typeCompatibles": []
            },
            "Resource": {
                "typeConvert": (value) => {
                    if (isObject(value)) {
                        return value;
                    }
                    return undefined;
                },
                "typeCompatibles": []
            }
        };
        this[_graphModels] = [];
        this[_graphErrno] = null;
    }

    /**
     * Returns this graph fancy name
     * @returns {string}
     */
    get fancyName() { return "graph (" + this[_graphBlocks].length + " blocks)"; }
    /**
     * @returns {Array<Block>}
     */
    get graphBlocks() { return this[_graphBlocks]; }
    /**
     * @returns {Array<Variable>}
     */
    get graphVariables() { return this[_graphVariables]; }
    /**
     * @returns {Array<Connection>}
     */
    get graphConnections() { return this[_graphConnections]; }
    /**
     * @returns {Array<Graph.modelBlockTypedef>}
     */
    get graphModels() { return this[_graphModels]; }

    /**
     * Adds the given block to this graph
     * @param {Block} block - the block to be added
     */
    addBlock(block) {
        if (block.blockGraph !== null) {
            throw new Error("`" + block.fancyName + "` cannot redefine `blockGraph`");
        }
        if (block.blockId !== null && typeof this[_graphBlockIds][block.blockId] === "undefined") {
            throw new Error("`" + this.fancyName + "` cannot redefine id `" + block.blockId + "`");
        }
        block.blockGraph = this;
        if (block.blockId === null) {
            block.blockId = this.nextBlockId();
        }
        forOwn(block.blockTemplates, (template, templateId) => {
            block.changeTemplate(templateId, template.valueType, true);
        });
        this[_graphBlocks].push(block);
        this[_graphBlockIds][block.blockId] = block;
        this.emit("block-add", block);
        block.added();
    }
    /**
     * Removes the given block from this graph
     * @param {Block} block - the block to be removed
     */
    removeBlock(block) {
        if (block.blockGraph !== this || !includes(this[_graphBlocks], block)) {
            throw new Error("`" + this.fancyName + "` has no block `" + block.fancyName + "`");
        }
        block.removePoints();
        pull(this[_graphBlocks], block);
        delete this[_graphBlockIds][block.blockId];
        this.emit("block-remove", block);
        block.removed();
    }
    /**
     * Returns the next unique blockId
     * @returns {string}
     */
    nextBlockId() {
        return (Math.random() * 9999) + this;
    }
    /**
     * Returns the block for the given blockId
     * @param {string} blockId - the blockId to search for
     * @returns {Block|null}
     */
    blockById(blockId) {
        return this[_graphBlockIds][blockId] || null;
    }
    /**
     * Returns the blocks with the given name
     * @param {string} blockName - the block name to search
     * @returns {Array<Block>}
     */
    blocksByName(blockName) {
        return filter(this[_graphBlocks], (block) => {
            return block.blockName === blockName;
        });
    }
    /**
     * Returns the blocks with the given type
     * @param {string} blockType - the block type to search
     * @returns {Array<Block>}
     */
    blocksByType(blockType) {
        return filter(this[_graphBlocks], (block) => {
            return block.blockType === blockType || block instanceof blockType;
        });
    }

    /**
     * Adds the given variable to this graph
     * @param {Variable} variable - the variable to be added
     */
    addVariable(variable) {
        if (variable.variableGraph !== null) {
            throw new Error("`" + variable.fancyName + "` cannot redefine `variableGraph`");
        }
        if (this.variableByName(variable.variableName) !== null) {
            throw new Error("`" + this.fancyName + "` cannot redefine variable name `" + variable.variableName + "`");
        }
        variable.variableGraph = this;
        variable.added();
        this[_graphVariables].push(variable);
        this.emit("variable-add", variable);
    }
    /**
     * Removes the given variable from this graph
     * @param {Variable} variable - the variable to be removed
     */
    removeVariable(variable) {
        if (variable.variableGraph !== this || this.variableByName(variable.variableName) === null) {
            throw new Error("`" + this.fancyName + "` has no variable `" + variable.fancyName + "`");
        }
        if (variable.variableBlock !== null) {
            this.removeBlock(variable.variableBlock);
        }
        pull(this[_graphVariables], variable);
        this.emit("variable-remove", variable);
    }
    /**
     * Returns this graph variable for the given variableName
     * @param {string} variableName - the variable name to search for
     * @returns {Variable|null}
     */
    variableByName(variableName) {
        return find(this[_graphVariables], (variable) => {
                return variable.variableName === variableName;
        }) || null;
    }

    /**
     * Converts the given value to the given type if possible or returns undefined
     * @param {Graph.graphValueTypeTypedef} valueType - the value type to enforce
     * @param {*|null} value - the value to convert
     * @returns {*|undefined}
     */
    convertValue(valueType, value) {
        if (value === null) {
            return null;
        }
        var valueTypeInfo = this.valueTypeByName(valueType);
        if (valueTypeInfo === null) {
            throw new Error("`" + this.fancyName + "` has no valueType `" + valueType + "`");
        }
        if (typeof valueTypeInfo.typeConvert === "undefined") {
            throw new Error("`" + this.fancyName + "` has no valueType `" + valueType + "` converter");
        }
        return valueTypeInfo.typeConvert(value);
    }
    /**
     * Returns whether the connection can be converted from inputPoint to outputPoint
     * @param {Point|Graph.modelPointTypedef} outputPoint - a
     * @param {Point|Graph.modelPointTypedef} inputPoint - b
     * @returns {boolean}
     */
    convertConnection(outputPoint, inputPoint) {
        var inputValueType = this.valueTypeByName(inputPoint.pointValueType);

        if (inputValueType === null) {
            throw new Error("`" + this.fancyName + "` cannot find compatible type to convert connection from `" +
                outputPoint.pointValueType + "` to `" + inputPoint.pointValueType + "`");
        }

        if (typeof outputPoint.pointOutput !== "undefined" && !outputPoint.pointOutput) {
            this.errno(Error("`" + outputPoint.fancyName + "` is not an output"));
            return false;
        }
        if (typeof inputPoint.pointOutput !== "undefined" && inputPoint.pointOutput) {
            this.errno(Error("`" + inputPoint.fancyName + "` is not an input"));
            return false;
        }

        if (typeof outputPoint.pointValue !== "undefined" && outputPoint.pointValue !== null) {
            this.errno(new Error("`" + outputPoint.fancyName + "` have a non-null `pointValue` and cannot be connected"));
            return false;
        }
        if (typeof inputPoint.pointValue !== "undefined" && inputPoint.pointValue !== null) {
            this.errno(new Error("`" + inputPoint.fancyName + "` have a non-null `pointValue` and cannot be connected"));
            return false;
        }

        if (typeof outputPoint.hasPolicy !== "undefined" && outputPoint.hasPolicy(PointPolicy.SINGLE_CONNECTION) && !outputPoint.emptyConnection()) {
            this.errno(new Error("`" + outputPoint.fancyName + "` cannot have multiple connections"));
            return false;
        }
        if (typeof inputPoint.hasPolicy !== "undefined" && inputPoint.hasPolicy(PointPolicy.SINGLE_CONNECTION) && !inputPoint.emptyConnection()) {
            this.errno(new Error("`" + inputPoint.fancyName + "` cannot have multiple connections"));
            return false;
        }

        if (typeof outputPoint.hasPolicy !== "undefined" && !outputPoint.hasPolicy(PointPolicy.SINGLE_CONNECTION) && !outputPoint.hasPolicy(PointPolicy.MULTIPLE_CONNECTIONS)) {
            this.errno(new Error("`" + outputPoint.fancyName + "` cannot have connections"));
            return false;
        }
        if (typeof inputPoint.hasPolicy !== "undefined" && !inputPoint.hasPolicy(PointPolicy.SINGLE_CONNECTION) && !inputPoint.hasPolicy(PointPolicy.MULTIPLE_CONNECTIONS)) {
            this.errno(new Error("`" + inputPoint.fancyName + "` cannot have connections"));
            return false;
        }

        if (outputPoint.pointValueType === inputPoint.pointValueType) {
            return true;
        }

        if (typeof outputPoint.hasPolicy !== "undefined" && !outputPoint.hasPolicy(PointPolicy.CONVERSION)) {
            this.errno(new Error("`" + outputPoint.fancyName + "` cannot be converted"));
            return false;
        }
        if (typeof inputPoint.hasPolicy !== "undefined" && !inputPoint.hasPolicy(PointPolicy.CONVERSION)) {
            this.errno(new Error("`" + inputPoint.fancyName + "` cannot be converted"));
            return false;
        }

        if (!includes(inputValueType.typeCompatibles, outputPoint.pointValueType)) {
            this.errno(new Error("`" + inputPoint.pointValueType + "` is not compatible with `" +
                outputPoint.pointValueType + "`"));
            return false;
        }

        var previousErrno = this[_graphErrno];
        if (typeof outputPoint.acceptConnect !== "undefined" && !outputPoint.acceptConnect(inputPoint)) {
            if (this[_graphErrno] !== null && this[_graphErrno] !== previousErrno) {
                this.errno(new Error("`" + outputPoint.fancyName +
                    "` cannot accept to connect to `" + inputPoint.fancyName + "`: " + this[_graphErrno].message));
            } else {
                this.errno(new Error("`" + outputPoint.fancyName +
                    "` cannot accept to connect to `" + inputPoint.fancyName + "`"));
            }
            return false;
        }
        previousErrno = this[_graphErrno];
        if (typeof inputPoint.acceptConnect !== "undefined" && !inputPoint.acceptConnect(outputPoint)) {
            if (this[_graphErrno] !== null && this[_graphErrno] !== previousErrno) {
                this.errno(new Error("`" + outputPoint.fancyName +
                    "` cannot accept to connect to `" + inputPoint.fancyName + "`: " + this[_graphErrno].message));
            } else {
                this.errno(new Error("`" + outputPoint.fancyName +
                    "` cannot accept to connect to `" + inputPoint.fancyName + "`"));
            }
            return false;
        }

        return true;
    }

    /**
     * Connects the given outputPoint to the given inputPoint
     * @param {Point} outputPoint - TODO document
     * @param {Point} inputPoint - TODO document
     * @returns {Connection}
     */
    connect(outputPoint, inputPoint) {
        if (outputPoint.pointBlock === null) {
            throw new Error("`" + outputPoint.fancyName + "` cannot connect to another point when not bound to a block");
        }
        if (inputPoint.pointBlock === null) {
            throw new Error("`" + inputPoint.fancyName + "` cannot connect to another point when not bound to a block");
        }
        if (outputPoint === inputPoint) {
            throw new Error("`" + this.fancyName + "` cannot connect `" + outputPoint.fancyName + "` to itself");
        }
        if (!outputPoint.pointOutput) {
            throw new Error("`" + outputPoint.fancyName + "` is not an output");
        }
        if (inputPoint.pointOutput) {
            throw new Error("`" + outputPoint.fancyName + "` is not an input");
        }
        if (!this.convertConnection(outputPoint, inputPoint)) {
            var connectionError = this[_graphErrno] || {};
            if (outputPoint.pointTemplate !== null || inputPoint.pointTemplate !== null) {
                try {
                    outputPoint.pointBlock.changeTemplate(outputPoint.pointTemplate, inputPoint.pointValueType);
                } catch (ex) {
                    if (inputPoint.pointTemplate !== null) {
                        inputPoint.pointBlock.changeTemplate(inputPoint.pointTemplate, outputPoint.pointValueType);
                    }
                }
            } else {
                throw new Error("`" + this.fancyName + "` cannot connect `" +
                    outputPoint.fancyName + "` to `" + inputPoint.fancyName + ": " + connectionError.message);
            }
        }
        var connectionFound = find(this[_graphConnections], (connection) => {
                return connection.connectionOutputPoint === outputPoint && connection.connectionInputPoint === inputPoint;
            }) || null;
        if (connectionFound !== null) {
            throw new Error("`" + connectionFound.fancyName + "` already exists");
        }
        var connection = new Connection(outputPoint, inputPoint);
        if (!outputPoint.pointBlock.acceptConnect(outputPoint, inputPoint)) {
            throw new Error(this[_graphErrno]);
        }
        if (!inputPoint.pointBlock.acceptConnect(inputPoint, outputPoint)) {
            throw new Error(this[_graphErrno]);
        }
        this._addConnection(connection);
        outputPoint.pointBlock.pointConnected(outputPoint, inputPoint);
        inputPoint.pointBlock.pointConnected(inputPoint, outputPoint);
        outputPoint.emit("connect", connection);
        inputPoint.emit("connect", connection);
        this.emit("point-connect", outputPoint, connection);
        this.emit("point-connect", inputPoint, connection);
        return connection;
    }
    /**
     * Disconnects the given outputPoint from the given inputPoint
     * @param {Point} outputPoint - TODO document
     * @param {Point} inputPoint - TODO document
     * @returns {Connection}
     */
    disconnect(outputPoint, inputPoint) {
        if (outputPoint.pointBlock === null) {
            throw new Error("`" + outputPoint.fancyName + "` cannot disconnect from another point when not bound to a block");
        }
        if (inputPoint.pointBlock === null) {
            throw new Error("`" + inputPoint.fancyName + "` cannot disconnect from another point when not bound to a block");
        }
        var connectionFound = find(this[_graphConnections], (connection) => {
                return connection.connectionOutputPoint === outputPoint && connection.connectionInputPoint === inputPoint;
            }) || null;
        if (connectionFound === null) {
            throw new Error("`" + this.fancyName + "` cannot find a connection between `" +
                outputPoint.fancyName + "` and `" + inputPoint.fancyName + "`");
        }
        this._removeConnection(connectionFound);
        outputPoint.pointBlock.pointDisconnected(outputPoint, inputPoint);
        inputPoint.pointBlock.pointDisconnected(inputPoint, outputPoint);
        outputPoint.emit("disconnect", connectionFound);
        inputPoint.emit("disconnect", connectionFound);
        this.emit("point-disconnect", outputPoint, connectionFound);
        this.emit("point-disconnect", inputPoint, connectionFound);
        return connectionFound;
    }
    /**
     * Adds the connection
     * @param {Connection} connection - the connection to add
     * @private
     */
    _addConnection (connection) {
        let outputPoint = connection.connectionOutputPoint;
        let inputPoint = connection.connectionInputPoint;
        if (includes(outputPoint.pointConnections, connection)) {
            throw new Error("`" + outputPoint.fancyName + "` cannot redefine `" + connection.fancyName + "`");
        }
        if (includes(inputPoint.pointConnections, connection)) {
            throw new Error("`" + inputPoint.fancyName + "` cannot redefine `" + connection.fancyName + "`");
        }
        outputPoint.pointConnections.push(connection);
        inputPoint.pointConnections.push(connection);
        this[_graphConnections].push(connection);
    }
    /**
     * Removes the given connection
     * @param {Connection} connection - the connection to remove
     * @private
     */
    _removeConnection (connection) {
        let outputPoint = connection.connectionOutputPoint;
        let inputPoint = connection.connectionInputPoint;
        if (!includes(outputPoint.pointConnections, connection)) {
            throw new Error("`" + outputPoint.fancyName + "` has no connection `" + connection.fancyName + "`");
        }
        if (!includes(inputPoint.pointConnections, connection)) {
            throw new Error("`" + inputPoint.fancyName + "` has no connection `" + connection.fancyName + "`");
        }
        pull(connection.connectionOutputPoint.pointConnections, connection);
        pull(connection.connectionInputPoint.pointConnections, connection);
        pull(this[_graphConnections], connection);
    }

    /**
     * Adds the value type to this graph
     * @param {Graph.graphValueTypeInfoTypedef} valueTypeInfo - the value type to add
     */
    addValueType(valueTypeInfo) {
        if (this.valueTypeByName(valueTypeInfo.typeName) !== null) {
            throw new Error("`" + this.fancyName + "` cannot redefine value type`" + valueTypeInfo.typeName + "`");
        }
        this[_graphValueTypes][valueTypeInfo.typeName] = valueTypeInfo;
    }
    /**
     * Returns the valueTypeInfo for the given typeName, or null
     * @param {Graph.graphValueTypeTypedef} typeName - the typeName to search for
     * @returns {Graph.graphValueTypeInfoTypedef|null}
     */
    valueTypeByName(typeName) {
        return this[_graphValueTypes][typeName] || null;
    }

    query() {}

    /**
     * Sets the last error
     * @param {Error} errno - the last error
     */
    errno(errno) {
        this[_graphErrno] = errno;
    }

}

/**
 * @typedef {Object} Graph.templateTypedef
 * @property {string} valueType
 * @property {Array<string>} templates
 */

/**
 * @typedef {string} Graph.graphValueTypeTypedef
 */

/**
 * @typedef {Object} Graph.graphValueTypeInfoTypedef
 * @property {string} typeName
 * @property {Graph.convertTypeCallback} typeConvert
 * @property {Array<string>} [typeCompatibles=[]]
 */

/**
 * @typedef {Object} Graph.modelPointTypedef
 * @property {string} pointType
 * @property {string} pointName
 * @property {string} pointValueType
 * @property {*|null} pointValue
 * @property {number} [pointPolicy=0]
 */

/**
 * @typedef {Object} Graph.modelTemplateTypedef
 * @property {string} valueType
 * @property {Array<string>} templates
 */

/**
 * @typedef {Object} Graph.modelBlockTypedef
 * @property {Object} item
 * @property {string} item.name
 * @property {string} item.icon
 * @property {Object} item.data
 * @property {string} item.data.blockType
 * @property {string} item.data.blockName
 * @property {Graph.modelTemplateTypedef} [item.data.blockTemplate]
 * @property {Array<Graph.modelPointTypedef>} item.data.blockInputs
 * @property {Array<Graph.modelPointTypedef>} item.data.blockOutputs
 * @property {string} [item.data.modelPointName] - Filled for autocomplete purpose
 */

/**
 * Callback to convert the given value to valueType, or undefined on conversion failure
 * @callback Graph.convertTypeCallback
 * @param {*|null} value
 * @returns {*|undefined}
 */
