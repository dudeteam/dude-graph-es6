/*eslint no-unused-vars: "off"*/
import EventClass from "event-class-es6";

import defaultValue from "./utils/default";

const _id = Symbol("id");
const _name = Symbol("name");
const _inputs = Symbol("inputs");
const _outputs = Symbol("outputs");
const _templates = Symbol("blockTemplate");
const _graph = Symbol("graph");

export default class Block extends EventClass {

    /**
     * Creates a block from the specified block data
     * @param {Block.blockDataTypedef} [blockData={}] - specifies the block data
     */
    constructor(blockData) {
        super();

        if (typeof blockData === "undefined") {
            blockData = {};
        }
        this[_id] = defaultValue(blockData.id, null);
        this[_name] = defaultValue(blockData.name, this.type);
        this[_inputs] = [];
        this[_outputs] = [];
        this[_templates] = defaultValue(blockData.templates, {});
        this[_graph] = null;
        if (this[_id] !== null && typeof this[_id] !== "string") {
            throw new Error(this.fancyName + " must have a null or valid string id");
        }
        if (typeof this[_name] !== "string") {
            throw new Error(this.fancyName + " must have a non-null name");
        }
    }

    /**
     * Returns this block fancy name
     * @returns {string}
     */
    get fancyName() { return this[_name]; }
    /**
     * Returns this block type
     * @returns {string}
     */
    get type() { return this.constructor.name; }
    /**
     * Returns this block id
     * @returns {string|null}
     */
    get id() { return this[_id]; }
    /**
     * Sets this block id to the specified id
     * @param {string|null} id - specifies the id
     */
    set id(id) { this[_id] = id; }
    /**
     * Returns this block name
     * @returns {string}
     */
    get name() { return this[_name]; }
    /**
     * Returns this block input points
     * @returns {Array<Point>}
     */
    get inputs() { return this[_inputs]; }
    /**
     * Returns this block output points
     * @returns {Array<Point>}
     */
    get outputs() { return this[_outputs]; }
    /**
     * Returns this block input and output points
     * @returns {Array<Point>}
     */
    get points() { return this[_inputs].concat(this[_outputs]); }
    /**
     * Returns this block templates
     * @returns {Object<string, Block.templateTypedef>}
     */
    get templates() { return this[_templates]; }
    /**
     * Returns this block graph
     * @returns {Graph|null}
     */
    get graph() { return this[_graph]; }
    /**
     * Sets this block graph to the specified graph
     * @param {Graph|null} graph - specifies the graph
     */
    set graph(graph) { this[_graph] = graph; }

    /**
     * Called when this block is added to a graph
     */
    added() {}
    /**
     * Called when the specified point is added to this block
     * @param {Point} point - specifies the point
     */
    pointAdded(point) {}
    /**
     * Called when the specified point of this block connected to another point
     * @param {Point} blockPoint - specifies the point of this block
     * @param {Point} otherPoint - specifies the other point
     */
    pointConnected(blockPoint, otherPoint) {}
    /**
     * Called when the specified point of this block changed its value
     * @param {Point} point - specifies the point
     * @param {*} value - specifies the value
     * @param {*} oldValue - specifies the previous value
     */
    pointValueChanged(point, value, oldValue) {}
    /**
     * Called when the specified point of this block disconnected from another point
     * @param {Point} blockPoint - specifies the point of this block
     * @param {Point} otherPoint - specifies the other point
     */
    pointDisconnected(blockPoint, otherPoint) {}
    /**
     * Called when the specified point is removed from this block
     * @param {Point} point - specifies the point
     */
    pointRemoved(point) {}
    /**
     * Called when this block is removed from the graph
     */
    removed() {}

    /**
     * Called when the static points are created
     */
    validatePoints() {}

    /**
     * Changes this template value type corresponding to the specified template name to the specified value type
     * @param {string} templateName - specifies the template name
     * @param {string} valueType - specifies the value type
     * @param {boolean} [ignoreEmit=false] - whether to emit events
     */
    changeTemplate(templateName, valueType, ignoreEmit) {
        if (this[_graph] === null) {
            throw new Error(this.fancyName + " cannot manipulate templates when not bound to a graph");
        }
        if (this[_graph].valueTypeByName(valueType) === null) {
            throw new Error(this.fancyName + " has no value type " + valueType);
        }
        const template = this.templateByName(templateName);
        if (template === null) {
            throw new Error(this.fancyName + " has no template " + templateName);
        }
        if (!template.templates.includes(valueType)) {
            throw new Error(this.fancyName + " has no value type " + valueType +
                " is its templates:  " + template.templates.join(", "));
        }
        if (template.valueType === valueType) {
            return; // Already the same type
        }
        const oldValueType = template.valueType;
        const inputValueSaves = this[_inputs].map((point) => {
            if (point.template === templateName) {
                return point.value;
            }
            return undefined;
        });
        const outputValueSaves = this[_outputs].map((point) => {
            if (point.template === templateName) {
                return point.value;
            }
            return undefined;
        });
        try {
            for (const point of this[_inputs]) {
                if (point.template === templateName) {
                    point.changeValueType(valueType, ignoreEmit);
                }
            }
            for (const point of this[_outputs]) {
                if (point.template === templateName) {
                    point.changeValueType(valueType, ignoreEmit);
                }
            }
        } catch (exception) {
            for (let i = 0; i < this[_inputs].length; i++) {
                const point = this[_inputs][i];
                if (point.template === templateName) {
                    point.changeValue(null);
                    point.changeValueType(oldValueType, true);
                    point.changeValue(inputValueSaves[i]);
                }
            }
            for (let i = 0; i < this[_outputs].length; i++) {
                const point = this[_outputs][i];
                if (point.template === templateName) {
                    point.changeValue(null);
                    point.changeValueType(oldValueType, true);
                    point.changeValue(outputValueSaves[i]);
                }
            }
            throw exception;
        }
        template.valueType = valueType;
        if (!ignoreEmit) {
            this[_graph].emit("block-template-update", this, templateName, template.valueType, oldValueType);
            this.emit("template-update", templateName, template.valueType, oldValueType);
        }
    }
    /**
     * Returns the template corresponding to the specified template name
     * @param {string} templateName - specifies the template name
     * @returns {Graph.templateTypedef|null}
     */
    templateByName(templateName) {
        if (this[_graph] === null) {
            throw new Error(this.fancyName + " cannot manipulate templates when not bound to a graph");
        }
        return this[_templates][templateName] || null;
    }

    /**
     * Adds the specified point to this block
     * @param {Point} point - specifies the point
     * @param {number} [position] - the position of the point in the block
     */
    addPoint(point, position) {
        if (this[_graph] === null) {
            throw new Error(this.fancyName + " cannot add point when not bound to a graph");
        }
        if (point.input && this.inputByName(point.name) !== null) {
            throw new Error(this.fancyName + " cannot redefine " + point.name);
        }
        if (point.output && this.outputByName(point.name) !== null) {
            throw new Error(this.fancyName + " cannot redefine " + point.name);
        }
        point.block = this;
        try {
            if (point.template === null) {
                point.changeValueType(point.valueType, true);
            } else {
                const template = this.templateByName(point.template);
                if (template === null) {
                    //noinspection ExceptionCaughtLocallyJS
                    throw new Error(this.fancyName + " has no template " + point.template);
                }
                point.changeValueType(template.valueType, true);
            }
            point.changeValue(point.value, true);
        } catch (ex) {
            point.block = null;
            throw ex;
        }
        this.pointAdded(point);
        point.added();
        if (typeof position === "undefined") {
            position = point.input ? this[_inputs].length : this[_outputs].length;
        }
        if (point.input) {
            this[_inputs].splice(position, 0, point);
        } else {
            this[_outputs].splice(position, 0, point);
        }
        this.emit("point-add", point);
        this[_graph].emit("block-point-add", this, point);
    }
    /**
     * Removes the specified point from this block
     * @param {Point} point - specifies the point
     */
    removePoint(point) {
        if (point.input && this.inputByName(point.name) === null) {
            throw new Error(this.fancyName + " has no input " + point.name);
        }
        if (point.output && this.outputByName(point.name) === null) {
            throw new Error(this.fancyName + " has not output " + point.name);
        }
        point.disconnectAll();
        this.pointRemoved(point);
        point.removed();
        point.block = null;
        if (point.input) {
            this[_inputs].splice(this[_inputs].indexOf(point), 1);
        } else {
            this[_outputs].splice(this[_outputs].indexOf(point), 1);
        }
        this.emit("point-remove", point);
        this[_graph].emit("block-point-remove", this, point);
    }
    /**
     * Removes all block points
     */
    removePoints() {
        const block = this;
        for (let i = this[_inputs].length - 1; i >= 0; i--) {
            block.removePoint(this[_inputs][i]);
        }
        for (let i = this[_outputs].length - 1; i >= 0; i--) {
            block.removePoint(this[_outputs][i]);
        }
    }
    /**
     * Returns the corresponding input point for the specified point name
     * @param {string} name - specifies the point name
     * @returns {Point|null}
     */
    inputByName(name) {
        return this[_inputs].find(point => point.name === name) || null;
    }
    /**
     * Returns the corresponding output point for the specified point name
     * @param {string} name - specifies the point name
     * @returns {Point|null}
     */
    outputByName(name) {
        return this[_outputs].find(point => point.name === name) || null;
    }

    /**
     * Returns whether this block allows the connection between the specified block point and the other point
     * @param {Point} blockPoint - specifies this block point
     * @param {Point} otherPoint - specifies the other point
     * @returns {boolean}
     */
    acceptConnect(blockPoint, otherPoint) {
        if (blockPoint.block !== this) {
            throw new Error(this.fancyName + " has no point " + blockPoint.name);
        }
        return otherPoint === otherPoint;
    }

}

/**
 * @typedef {Object} Block.templateTypedef
 * @property {String} valueType
 * @property {Array<String>} templates
 */

/**
 * @typedef {Object} Block.blockDataTypedef
 * @property {string|null} [id=null]
 * @property {string} [name]
 * @property {Object<string, Graph.templateTypedef>} [templates={}]
 */
