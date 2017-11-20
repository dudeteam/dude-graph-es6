import EventClass from "event-class-es6";

import valueTypes from "./utils/types";
import Connection from "./connection";
import PointPolicy from "./policy";

import uuid from "./utils/uuid";

const _errno = Symbol("errno");
const _blocks = Symbol("blocks");
const _blockIds = Symbol("blockIds");
const _valueTypes = Symbol("valueTypes");
const _connections = Symbol("connections");

export default class Graph extends EventClass {

    constructor() {
        super();

        this[_errno] = null;
        this[_blocks] = [];
        this[_blockIds] = {};
        this[_valueTypes] = valueTypes;
        this[_connections] = [];
    }

    /**
     * Returns this graph fancy name
     * @returns {string}
     */
    get fancyName() { return "graph (" + this[_blocks].length + " blocks)"; }
    /**
     * Returns this graph blocks
     * @returns {Array<Block>}
     */
    get blocks() { return this[_blocks]; }
    /**
     * Returns this graph connections
     * @returns {Array<Connection>}
     */
    get connections() { return this[_connections]; }

    /**
     * Adds the specified block to this graph
     * @param {Block} block - the block to add
     */
    addBlock(block) {
        if (block.graph !== null) {
            throw new Error(block.fancyName + " cannot redefine graph");
        }
        if (block.id !== null && typeof this[_blockIds][block.id] !== "undefined") {
            throw new Error(this.fancyName + " cannot redefine id " + block.id);
        }
        if (block.id === null) {
            block.id = this.nextId();
        }
        block.graph = this;
        for (const templateId in block.templates) {
            // for(const [template, templateId] of Object.entries(block.templates))
            if (block.templates.hasOwnProperty(templateId)) {
                block.changeTemplate(templateId, block.templates[templateId].valueType, true);
            }
        }
        this.blocks.push(block);
        this[_blockIds][block.id] = block;
        this.emit("block-add", block);
        block.added();
    }
    /**
     * Removes the specified block from this graph
     * @param {Block} block - the block to remove
     */
    removeBlock(block) {
        if (block.graph !== this || !this.blocks.includes(block)) {
            throw new Error(this.fancyName + " has no block " + block.fancyName);
        }
        block.removePoints();
        block.graph = null;
        this.blocks.splice(this.blocks.indexOf(block), 1);
        this[_blockIds][block.id] = undefined;
        this.emit("block-remove", block);
        block.removed();
    }

    //noinspection JSMethodCanBeStatic
    /**
     * Returns the next unique block id
     * @returns {string}
     */
    nextId() {
        return uuid();
    }
    /**
     * Returns the block corresponding to the specified block id
     * @param {string} id - specifies the block id
     * @returns {Block|null}
     */
    blockById(id) {
        return this[_blockIds][id] || null;
    }
    /**
     * Returns the blocks corresponding to the specified block name
     * @param {string} name - specifies the block name
     * @returns {Array<Block>}
     */
    blocksByName(name) {
        return this.blocks.filter(block => block.name === name);
    }
    /**
     * Returns the blocks corresponding to the specified block type
     * @param {string} type - specifies the block type
     * @returns {Array<Block>}
     */
    blocksByType(type) {
        return this.blocks.filter(block => block.type === type || (typeof type === "function" && block instanceof type));
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
     * Returns whether the connection is possible from the specified output point to the specified input point
     * @param {Point} outputPoint - specifies the output point
     * @param {Point} inputPoint - specifies the input point
     * @returns {boolean}
     */
    connectionPossible(outputPoint, inputPoint) {
        const inputValueType = this.valueTypeByName(inputPoint.valueType);

        if (inputValueType === null) {
            throw new Error(this.fancyName + " cannot find compatible type to convert connection from " +
                outputPoint.valueType + " to " + inputPoint.valueType);
        }

        if (!inputPoint.input) {
            this.errno(Error(inputPoint.fancyName + " is not an input"));
            return false;
        }
        if (!outputPoint.output) {
            this.errno(Error(outputPoint.fancyName + " is not an output"));
            return false;
        }

        if (inputPoint.value !== null) {
            this.errno(new Error(inputPoint.fancyName + " have a non-null value and cannot be connected"));
            return false;
        }
        if (outputPoint.value !== null) {
            this.errno(new Error(outputPoint.fancyName + " have a non-null value and cannot be connected"));
            return false;
        }

        if (inputPoint.hasPolicy(PointPolicy.SINGLE_CONNECTION) && !inputPoint.emptyConnection()) {
            this.errno(new Error(inputPoint.fancyName + " cannot have multiple connections"));
            return false;
        }
        if (outputPoint.hasPolicy(PointPolicy.SINGLE_CONNECTION) && !outputPoint.emptyConnection()) {
            this.errno(new Error(outputPoint.fancyName + " cannot have multiple connections"));
            return false;
        }

        if (!inputPoint.hasPolicy(PointPolicy.SINGLE_CONNECTION) && !inputPoint.hasPolicy(PointPolicy.MULTIPLE_CONNECTIONS)) {
            this.errno(new Error(inputPoint.fancyName + " cannot have connections"));
            return false;
        }
        if (!outputPoint.hasPolicy(PointPolicy.SINGLE_CONNECTION) && !outputPoint.hasPolicy(PointPolicy.MULTIPLE_CONNECTIONS)) {
            this.errno(new Error(outputPoint.fancyName + " cannot have connections"));
            return false;
        }

        if (inputPoint.valueType !== outputPoint.valueType) {
            if (!inputPoint.hasPolicy(PointPolicy.CONVERSION)) {
                this.errno(new Error(inputPoint.fancyName + " cannot be converted"));
                return false;
            }
            if (!outputPoint.hasPolicy(PointPolicy.CONVERSION)) {
                this.errno(new Error(outputPoint.fancyName + " cannot be converted"));
                return false;
            }

            if (!inputValueType.typeCompatibles.includes(outputPoint.valueType)) {
                this.errno(new Error(inputPoint.valueType + " is not compatible with " +
                    outputPoint.valueType));
                return false;
            }
        }

        let previousErrno = this[_errno];
        if (!inputPoint.acceptConnect(outputPoint)) {
            if (this[_errno] !== null && this[_errno] !== previousErrno) {
                this.errno(new Error(outputPoint.fancyName +
                    " cannot accept to connect to " + inputPoint.fancyName + ": " + this[_errno].message));
            } else {
                this.errno(new Error(outputPoint.fancyName +
                    " cannot accept to connect to " + inputPoint.fancyName));
            }
            return false;
        }
        previousErrno = this[_errno];
        if (!outputPoint.acceptConnect(inputPoint)) {
            if (this[_errno] !== null && this[_errno] !== previousErrno) {
                this.errno(new Error(outputPoint.fancyName +
                    " cannot accept to connect to " + inputPoint.fancyName + ": " + this[_errno].message));
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
     * @param {Point} inputPoint - specifies the input point
     * @param {Point} outputPoint - specifies the output point
     * @returns {Connection}
     */
    connect(inputPoint, outputPoint) {
        if (inputPoint.block === null) {
            throw new Error(inputPoint.fancyName + " cannot connect to another point when not bound to a block");
        }
        if (outputPoint.block === null) {
            throw new Error(outputPoint.fancyName + " cannot connect to another point when not bound to a block");
        }
        if (inputPoint === outputPoint) {
            throw new Error(this.fancyName + " cannot connect " + inputPoint.fancyName + " to itself");
        }
        if (!inputPoint.input) {
            throw new Error(outputPoint.fancyName + " is not an input");
        }
        if (!outputPoint.output) {
            throw new Error(outputPoint.fancyName + " is not an output");
        }
        if (!this.connectionPossible(outputPoint, inputPoint)) {
            if (outputPoint.template !== null || inputPoint.template !== null) {
                try {
                    outputPoint.block.changeTemplate(outputPoint.template, inputPoint.valueType);
                } catch (ex) {
                    if (inputPoint.template !== null) {
                        inputPoint.block.changeTemplate(inputPoint.template, outputPoint.valueType);
                    }
                }
            }
            if (!this.connectionPossible(outputPoint, inputPoint)) {
                throw new Error(this.fancyName + " cannot connect " +
                    outputPoint.fancyName + " to " + inputPoint.fancyName + ": " + this[_errno].message);
            }
        }
        const connectionFound = this.connectionForPoints(inputPoint, outputPoint);
        if (connectionFound !== null) {
            throw new Error(connectionFound.fancyName + " already exists");
        }
        const connection = new Connection(inputPoint, outputPoint);
        if (!inputPoint.block.acceptConnect(inputPoint, outputPoint)) {
            throw new Error(this[_errno]);
        }
        if (!outputPoint.block.acceptConnect(outputPoint, inputPoint)) {
            throw new Error(this[_errno]);
        }
        this._addConnection(connection);
        inputPoint.block.pointConnected(inputPoint, outputPoint);
        outputPoint.block.pointConnected(outputPoint, inputPoint);
        inputPoint.connected(outputPoint);
        outputPoint.connected(inputPoint);
        inputPoint.emit("connect", connection);
        outputPoint.emit("connect", connection);
        inputPoint.block.emit("point-connect", inputPoint, connection);
        outputPoint.block.emit("point-connect", outputPoint, connection);
        this.emit("point-connect", inputPoint, connection);
        this.emit("point-connect", outputPoint, connection);
        return connection;
    }
    /**
     * Disconnects the specified points
     * @param {Point} inputPoint - specifies the input point
     * @param {Point} outputPoint - specifies the output point
     * @returns {Connection}
     */
    disconnect(inputPoint, outputPoint) {
        if (inputPoint.block === null) {
            throw new Error(inputPoint.fancyName + " cannot disconnect from another point when not bound to a block");
        }
        if (outputPoint.block === null) {
            throw new Error(outputPoint.fancyName + " cannot disconnect from another point when not bound to a block");
        }
        const connectionFound = this.connectionForPoints(inputPoint, outputPoint);
        if (connectionFound === null) {
            throw new Error(this.fancyName + " cannot find a connection between " +
                inputPoint.fancyName + " and " + outputPoint.fancyName);
        }
        this._removeConnection(connectionFound);
        inputPoint.block.pointDisconnected(inputPoint, outputPoint);
        outputPoint.block.pointDisconnected(outputPoint, inputPoint);
        inputPoint.disconnected(outputPoint);
        outputPoint.disconnected(inputPoint);
        inputPoint.emit("disconnect", connectionFound);
        outputPoint.emit("disconnect", connectionFound);
        inputPoint.block.emit("point-disconnect", inputPoint, connectionFound);
        outputPoint.block.emit("point-disconnect", outputPoint, connectionFound);
        this.emit("point-disconnect", inputPoint, connectionFound);
        this.emit("point-disconnect", outputPoint, connectionFound);
        return connectionFound;
    }
    /**
     * Returns the connection between the specified output point and input point or null
     * @param {Point} inputPoint - specifies the input point
     * @param {Point} outputPoint - specifies the output point
     * @returns {Connection|null}
     */
    connectionForPoints(inputPoint, outputPoint) {
        return this.connections.find(connection => {
                return connection.inputPoint === inputPoint && connection.outputPoint === outputPoint;
            }) || null;
    }
    /**
     * Adds the specified connection
     * @param {Connection} connection - specifies the connection
     * @private
     */
    _addConnection (connection) {
        const inputPoint = connection.inputPoint;
        const outputPoint = connection.outputPoint;
        if (inputPoint.connections.includes(connection)) {
            throw new Error(inputPoint.fancyName + " cannot redefine " + connection.fancyName);
        }
        if (outputPoint.connections.includes(connection)) {
            throw new Error(outputPoint.fancyName + " cannot redefine " + connection.fancyName);
        }
        inputPoint.connections.push(connection);
        outputPoint.connections.push(connection);
        this.connections.push(connection);
    }
    /**
     * Removes the specified connection
     * @param {Connection} connection - specifies the connection
     * @private
     */
    _removeConnection (connection) {
        const inputPoint = connection.inputPoint;
        const outputPoint = connection.outputPoint;
        if (!inputPoint.connections.includes(connection)) {
            throw new Error(inputPoint.fancyName + " has no connection " + connection.fancyName);
        }
        if (!outputPoint.connections.includes(connection)) {
            throw new Error(outputPoint.fancyName + " has no connection " + connection.fancyName);
        }
        connection.inputPoint.connections.splice(connection.inputPoint.connections.indexOf(connection), 1);
        connection.outputPoint.connections.splice(connection.outputPoint.connections.indexOf(connection), 1);
        this.connections.splice(this.connections.indexOf(connection), 1);
    }

    /**
     * Adds the specified value type to this graph
     * @param {Graph.valueTypeInfoTypedef} valueTypeInfo - specifies the value type
     */
    addValueType(valueTypeInfo) {
        if (this.valueTypeByName(valueTypeInfo.typeName) !== null) {
            throw new Error(this.fancyName + " cannot redefine value type" + valueTypeInfo.typeName);
        }
        this[_valueTypes][valueTypeInfo.typeName] = valueTypeInfo;
    }
    /**
     * Returns the value type corresponding to the specified value type name
     * @param {Graph.valueTypeTypedef} typeName - specifies the value type name
     * @returns {Graph.valueTypeInfoTypedef|null}
     */
    valueTypeByName(typeName) {
        return this[_valueTypes][typeName] || null;
    }

    /**
     * Sets the last error
     * @param {Error} errno - specifies the last error
     */
    errno(errno) {
        this[_errno] = errno;
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
