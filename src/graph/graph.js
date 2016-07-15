import EventClass from "event-class-es6";

import valueTypes from "./utils/types";
import Connection from "./connection";
import PointPolicy from "./policy";

import uuid from "./utils/uuid";

const _graphErrno = Symbol("graphErrno");
const _graphBlocks = Symbol("graphBlocks");
const _graphBlockIds = Symbol("graphBlockIds");
const _graphVariables = Symbol("graphVariables");
const _graphValueTypes = Symbol("graphValueTypes");
const _graphConnections = Symbol("graphConnections");

export default class Graph extends EventClass {

    constructor() {
        super();

        this[_graphErrno] = null;
        this[_graphBlocks] = [];
        this[_graphBlockIds] = {};
        this[_graphVariables] = [];
        this[_graphValueTypes] = valueTypes;
        this[_graphConnections] = [];
    }

    /**
     * Returns this graph fancy name
     * @returns {string}
     */
    get fancyName() { return "graph (" + this[_graphBlocks].length + " blocks)"; }
    /**
     * Returns this graph blocks
     * @returns {Array<Block>}
     */
    get graphBlocks() { return this[_graphBlocks]; }
    /**
     * Returns this graph variables
     * @returns {Array<Variable>}
     */
    get graphVariables() { return this[_graphVariables]; }
    /**
     * Returns this graph connections
     * @returns {Array<Connection>}
     */
    get graphConnections() { return this[_graphConnections]; }

    /**
     * Adds the specified block to this graph
     * @param {Block} block - the block to add
     */
    addBlock(block) {
        if (block.blockGraph !== null) {
            throw new Error(block.fancyName + " cannot redefine blockGraph");
        }
        if (block.blockId !== null && typeof this[_graphBlockIds][block.blockId] !== "undefined") {
            throw new Error(this.fancyName + " cannot redefine id " + block.blockId);
        }
        block.blockGraph = this;
        if (block.blockId === null) {
            block.blockId = this.nextBlockId();
        }
        for (const templateId in block.blockTemplates) {
            // for(const [template, templateId] of Object.entries(block.blockTemplates))
            if (block.blockTemplates.hasOwnProperty(templateId)) {
                block.changeTemplate(templateId, block.blockTemplates[templateId].valueType, true);
            }
        }
        this[_graphBlocks].push(block);
        this[_graphBlockIds][block.blockId] = block;
        this.emit("block-add", block);
        block.added();
    }
    /**
     * Removes the specified block from this graph
     * @param {Block} block - the block to remove
     */
    removeBlock(block) {
        if (block.blockGraph !== this || !this[_graphBlocks].includes(block)) {
            throw new Error(this.fancyName + " has no block " + block.fancyName);
        }
        block.removePoints();
        this[_graphBlocks].splice(this[_graphBlocks].indexOf(block), 1);
        this[_graphBlockIds][block.blockId] = undefined;
        this.emit("block-remove", block);
        block.removed();
    }

    //noinspection JSMethodCanBeStatic
    /**
     * Returns the next unique block id
     * @returns {string}
     */
    nextBlockId() {
        return uuid();
    }
    /**
     * Returns the block corresponding to the specified block id
     * @param {string} blockId - specifies the block id
     * @returns {Block|null}
     */
    blockById(blockId) {
        return this[_graphBlockIds][blockId] || null;
    }
    /**
     * Returns the blocks corresponding to the specified block name
     * @param {string} blockName - specifies the block name
     * @returns {Array<Block>}
     */
    blocksByName(blockName) {
        return this[_graphBlocks].filter(block => block.blockName === blockName);
    }
    /**
     * Returns the blocks corresponding to the specified block type
     * @param {string} blockType - specifies the block type
     * @returns {Array<Block>}
     */
    blocksByType(blockType) {
        return this[_graphBlocks].filter(block => block.blockType === blockType || block instanceof blockType);
    }

    /**
     * Adds the specified variable to this graph
     * @param {Variable} variable - specifies the variable
     */
    addVariable(variable) {
        if (variable.variableGraph !== null) {
            throw new Error(variable.fancyName + " cannot redefine variableGraph");
        }
        if (this.variableByName(variable.variableName) !== null) {
            throw new Error(this.fancyName + " cannot redefine variable name " + variable.variableName);
        }
        variable.variableGraph = this;
        variable.added();
        this[_graphVariables].push(variable);
        this.emit("variable-add", variable);
    }
    /**
     * Removes the specified variable from this graph
     * @param {Variable} variable - specifies the variable
     */
    removeVariable(variable) {
        if (variable.variableGraph !== this || this.variableByName(variable.variableName) === null) {
            throw new Error(this.fancyName + " has no variable " + variable.fancyName);
        }
        if (variable.variableBlock !== null) {
            this.removeBlock(variable.variableBlock);
        }
        this[_graphVariables].splice(this[_graphVariables].indexOf(variable), 1);
        this.emit("variable-remove", variable);
    }
    /**
     * Returns the variable corresponding to the specified variable name
     * @param {string} variableName - specifies the variable name
     * @returns {Variable|null}
     */
    variableByName(variableName) {
        return this[_graphVariables].find(variable => variable.variableName === variableName) || null;
    }

    /**
     * Converts the specified value to the corresponding value type
     * @param {Graph.valueTypeTypedef} valueType - specifies the value type
     * @param {*|null} value - specifies the value
     * @returns {*|undefined} - returns undefined on failure
     */
    convertValue(valueType, value) {
        if (value === null) {
            return null;
        }
        const valueTypeInfo = this.valueTypeByName(valueType);
        if (valueTypeInfo === null) {
            throw new Error(this.fancyName + " has no valueType " + valueType);
        }
        if (typeof valueTypeInfo.typeConvert === "undefined") {
            throw new Error(this.fancyName + " has no valueType " + valueType + " converter");
        }
        return valueTypeInfo.typeConvert(value);
    }
    /**
     * Returns whether the connection can be converted from the specified output point to the specified input point
     * @param {Point|Graph.modelPointTypedef} outputPoint - specifies the output point
     * @param {Point|Graph.modelPointTypedef} inputPoint - specifies the input point
     * @returns {boolean}
     */
    convertConnection(outputPoint, inputPoint) {
        const inputValueType = this.valueTypeByName(inputPoint.pointValueType);

        if (inputValueType === null) {
            throw new Error(this.fancyName + " cannot find compatible type to convert connection from " +
                outputPoint.pointValueType + " to " + inputPoint.pointValueType);
        }

        if (typeof outputPoint.pointOutput !== "undefined" && !outputPoint.pointOutput) {
            this.errno(Error(outputPoint.fancyName + " is not an output"));
            return false;
        }
        if (typeof inputPoint.pointOutput !== "undefined" && inputPoint.pointOutput) {
            this.errno(Error(inputPoint.fancyName + " is not an input"));
            return false;
        }

        if (typeof outputPoint.pointValue !== "undefined" && outputPoint.pointValue !== null) {
            this.errno(new Error(outputPoint.fancyName + " have a non-null pointValue and cannot be connected"));
            return false;
        }
        if (typeof inputPoint.pointValue !== "undefined" && inputPoint.pointValue !== null) {
            this.errno(new Error(inputPoint.fancyName + " have a non-null pointValue and cannot be connected"));
            return false;
        }

        if (typeof outputPoint.hasPolicy !== "undefined" && outputPoint.hasPolicy(PointPolicy.SINGLE_CONNECTION) && !outputPoint.emptyConnection()) {
            this.errno(new Error(outputPoint.fancyName + " cannot have multiple connections"));
            return false;
        }
        if (typeof inputPoint.hasPolicy !== "undefined" && inputPoint.hasPolicy(PointPolicy.SINGLE_CONNECTION) && !inputPoint.emptyConnection()) {
            this.errno(new Error(inputPoint.fancyName + " cannot have multiple connections"));
            return false;
        }

        if (typeof outputPoint.hasPolicy !== "undefined" && !outputPoint.hasPolicy(PointPolicy.SINGLE_CONNECTION) && !outputPoint.hasPolicy(PointPolicy.MULTIPLE_CONNECTIONS)) {
            this.errno(new Error(outputPoint.fancyName + " cannot have connections"));
            return false;
        }
        if (typeof inputPoint.hasPolicy !== "undefined" && !inputPoint.hasPolicy(PointPolicy.SINGLE_CONNECTION) && !inputPoint.hasPolicy(PointPolicy.MULTIPLE_CONNECTIONS)) {
            this.errno(new Error(inputPoint.fancyName + " cannot have connections"));
            return false;
        }

        if (outputPoint.pointValueType === inputPoint.pointValueType) {
            return true;
        }

        if (typeof outputPoint.hasPolicy !== "undefined" && !outputPoint.hasPolicy(PointPolicy.CONVERSION)) {
            this.errno(new Error(outputPoint.fancyName + " cannot be converted"));
            return false;
        }
        if (typeof inputPoint.hasPolicy !== "undefined" && !inputPoint.hasPolicy(PointPolicy.CONVERSION)) {
            this.errno(new Error(inputPoint.fancyName + " cannot be converted"));
            return false;
        }

        if (!inputValueType.typeCompatibles.includes(outputPoint.pointValueType)) {
            this.errno(new Error(inputPoint.pointValueType + " is not compatible with " +
                outputPoint.pointValueType));
            return false;
        }

        let previousErrno = this[_graphErrno];
        if (typeof outputPoint.acceptConnect !== "undefined" && !outputPoint.acceptConnect(inputPoint)) {
            if (this[_graphErrno] !== null && this[_graphErrno] !== previousErrno) {
                this.errno(new Error(outputPoint.fancyName +
                    " cannot accept to connect to " + inputPoint.fancyName + ": " + this[_graphErrno].message));
            } else {
                this.errno(new Error(outputPoint.fancyName +
                    " cannot accept to connect to " + inputPoint.fancyName));
            }
            return false;
        }
        previousErrno = this[_graphErrno];
        if (typeof inputPoint.acceptConnect !== "undefined" && !inputPoint.acceptConnect(outputPoint)) {
            if (this[_graphErrno] !== null && this[_graphErrno] !== previousErrno) {
                this.errno(new Error(outputPoint.fancyName +
                    " cannot accept to connect to " + inputPoint.fancyName + ": " + this[_graphErrno].message));
            } else {
                this.errno(new Error(outputPoint.fancyName +
                    " cannot accept to connect to " + inputPoint.fancyName));
            }
            return false;
        }

        return true;
    }

    /**
     * Connects the specified points
     * @param {Point} outputPoint - specifies the output point
     * @param {Point} inputPoint - specifies the input point
     * @returns {Connection}
     */
    connect(outputPoint, inputPoint) {
        if (outputPoint.pointBlock === null) {
            throw new Error(outputPoint.fancyName + " cannot connect to another point when not bound to a block");
        }
        if (inputPoint.pointBlock === null) {
            throw new Error(inputPoint.fancyName + " cannot connect to another point when not bound to a block");
        }
        if (outputPoint === inputPoint) {
            throw new Error(this.fancyName + " cannot connect " + outputPoint.fancyName + " to itself");
        }
        if (!outputPoint.pointOutput) {
            throw new Error(outputPoint.fancyName + " is not an output");
        }
        if (inputPoint.pointOutput) {
            throw new Error(outputPoint.fancyName + " is not an input");
        }
        if (!this.convertConnection(outputPoint, inputPoint)) {
            const connectionError = this[_graphErrno] || {};
            if (outputPoint.pointTemplate !== null || inputPoint.pointTemplate !== null) {
                try {
                    outputPoint.pointBlock.changeTemplate(outputPoint.pointTemplate, inputPoint.pointValueType);
                } catch (ex) {
                    if (inputPoint.pointTemplate !== null) {
                        inputPoint.pointBlock.changeTemplate(inputPoint.pointTemplate, outputPoint.pointValueType);
                    }
                }
            } else {
                throw new Error(this.fancyName + " cannot connect " +
                    outputPoint.fancyName + " to " + inputPoint.fancyName + ": " + connectionError.message);
            }
        }
        const connectionFound = this.connectionForPoints(outputPoint, inputPoint);
        if (connectionFound !== null) {
            throw new Error(connectionFound.fancyName + " already exists");
        }
        const connection = new Connection(outputPoint, inputPoint);
        if (!outputPoint.pointBlock.acceptConnect(outputPoint, inputPoint)) {
            throw new Error(this[_graphErrno]);
        }
        if (!inputPoint.pointBlock.acceptConnect(inputPoint, outputPoint)) {
            throw new Error(this[_graphErrno]);
        }
        this._addConnection(connection);
        outputPoint.pointBlock.pointConnected(outputPoint, inputPoint);
        inputPoint.pointBlock.pointConnected(inputPoint, outputPoint);
        outputPoint.connected(inputPoint);
        inputPoint.connected(outputPoint);
        outputPoint.emit("connect", connection);
        inputPoint.emit("connect", connection);
        this.emit("point-connect", outputPoint, connection);
        this.emit("point-connect", inputPoint, connection);
        return connection;
    }
    /**
     * Disconnects the specified points
     * @param {Point} outputPoint - specifies the output point
     * @param {Point} inputPoint - specifies the input point
     * @returns {Connection}
     */
    disconnect(outputPoint, inputPoint) {
        if (outputPoint.pointBlock === null) {
            throw new Error(outputPoint.fancyName + " cannot disconnect from another point when not bound to a block");
        }
        if (inputPoint.pointBlock === null) {
            throw new Error(inputPoint.fancyName + " cannot disconnect from another point when not bound to a block");
        }
        const connectionFound = this.connectionForPoints(outputPoint, inputPoint);
        if (connectionFound === null) {
            throw new Error(this.fancyName + " cannot find a connection between " +
                outputPoint.fancyName + " and " + inputPoint.fancyName);
        }
        this._removeConnection(connectionFound);
        outputPoint.pointBlock.pointDisconnected(outputPoint, inputPoint);
        inputPoint.pointBlock.pointDisconnected(inputPoint, outputPoint);
        outputPoint.disconnected(inputPoint);
        inputPoint.disconnected(outputPoint);
        outputPoint.emit("disconnect", connectionFound);
        inputPoint.emit("disconnect", connectionFound);
        this.emit("point-disconnect", outputPoint, connectionFound);
        this.emit("point-disconnect", inputPoint, connectionFound);
        return connectionFound;
    }
    /**
     * Returns the connection between the specified output point and input point or null
     * @param {Point} outputPoint - specifies the output point
     * @param {Point} inputPoint - specifies the input point
     * @returns {Connection|null}
     */
    connectionForPoints(outputPoint, inputPoint) {
        return this[_graphConnections].find((connection) => {
                return connection.connectionOutputPoint === outputPoint && connection.connectionInputPoint === inputPoint;
            }) || null;
    }
    /**
     * Adds the specified connection
     * @param {Connection} connection - specifies the connection
     * @private
     */
    _addConnection (connection) {
        const outputPoint = connection.connectionOutputPoint;
        const inputPoint = connection.connectionInputPoint;
        if (outputPoint.pointConnections.includes(connection)) {
            throw new Error(outputPoint.fancyName + " cannot redefine " + connection.fancyName);
        }
        if (inputPoint.pointConnections.includes(connection)) {
            throw new Error(inputPoint.fancyName + " cannot redefine " + connection.fancyName);
        }
        outputPoint.pointConnections.push(connection);
        inputPoint.pointConnections.push(connection);
        this[_graphConnections].push(connection);
    }
    /**
     * Removes the specified connection
     * @param {Connection} connection - specifies the connection
     * @private
     */
    _removeConnection (connection) {
        const outputPoint = connection.connectionOutputPoint;
        const inputPoint = connection.connectionInputPoint;
        if (!outputPoint.pointConnections.includes(connection)) {
            throw new Error(outputPoint.fancyName + " has no connection " + connection.fancyName);
        }
        if (!inputPoint.pointConnections.includes(connection)) {
            throw new Error(inputPoint.fancyName + " has no connection " + connection.fancyName);
        }
        connection.connectionOutputPoint.pointConnections.splice(connection.connectionOutputPoint.pointConnections.indexOf(connection), 1);
        connection.connectionInputPoint.pointConnections.splice(connection.connectionInputPoint.pointConnections.indexOf(connection), 1);
        this[_graphConnections].splice(this[_graphConnections].indexOf(connection), 1);
    }

    /**
     * Adds the specified value type to this graph
     * @param {Graph.valueTypeInfoTypedef} valueTypeInfo - specifies the value type
     */
    addValueType(valueTypeInfo) {
        if (this.valueTypeByName(valueTypeInfo.typeName) !== null) {
            throw new Error(this.fancyName + " cannot redefine value type" + valueTypeInfo.typeName);
        }
        this[_graphValueTypes][valueTypeInfo.typeName] = valueTypeInfo;
    }
    /**
     * Returns the value type corresponding to the specified value type name
     * @param {Graph.valueTypeTypedef} typeName - specifies the value type name
     * @returns {Graph.valueTypeInfoTypedef|null}
     */
    valueTypeByName(typeName) {
        return this[_graphValueTypes][typeName] || null;
    }

    /**
     * Sets the last error
     * @param {Error} errno - specifies the last error
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
 * @typedef {string} Graph.valueTypeTypedef
 */

/**
 * @typedef {Object} Graph.valueTypeInfoTypedef
 * @property {string} typeName
 * @property {Graph.convertTypeTypedef} typeConvert
 * @property {Array<string>} [typeCompatibles=[]]
 */

/**
 * @typedef {function} Graph.convertTypeTypedef
 * @param {*|null} value
 * @returns {*|undefined}
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
